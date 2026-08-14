import { eq, and, desc } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { player, arena, arenaPlayerResult, snapshot, playerSnapshot, rawSnapshot, syncExecution } from '@wyd/db';
import type { RankingsResponse } from '@wyd/shared';
import { checkSeasonReset, detectWinners, calcDelta, detectCurrentArenaNumber, todayStr } from '../lib/delta';

const API_URL = 'https://mochila.tapiocahut.com/royal-arena';

export class SyncService {
  constructor(private readonly db: Db) {}

  async trigger(triggeredBy: 'cron' | 'manual' = 'manual', retryCount = 0): Promise<{ ok: boolean; message: string; arenasCreated: number | null }> {
    const arenaDate = todayStr();
    const arenaNumber = detectCurrentArenaNumber();

    const [exec] = await this.db
      .insert(syncExecution)
      .values({ arenaDate, arenaNumber, triggeredBy, retryCount, status: 'RUNNING' })
      .returning();

    try {
      const data = await this.fetchRankings();

      // find previous snapshot BEFORE saving the new one
      const prevSnap = await this.db
        .select()
        .from(snapshot)
        .orderBy(desc(snapshot.collectedAt))
        .limit(1)
        .then((rows) => rows[0] ?? null);

      // save current snapshot
      const [snap] = await this.db
        .insert(snapshot)
        .values({ arenaDate, arenaNumber })
        .returning();

      await this.db.insert(rawSnapshot).values({ snapshotId: snap.id, payload: data });

      // upsert players → name→id map
      // deduplicate per (charName, div) keeping the entry with the highest winsTotal
      // the external API occasionally returns duplicate entries for the same player
      const rawEntries = [
        ...data.champion.map((p) => ({ ...p, div: 'champion' as const })),
        ...data.aspirant.map((p) => ({ ...p, div: 'aspirant' as const })),
      ];
      const dedupMap = new Map<string, typeof rawEntries[0]>();
      for (const entry of rawEntries) {
        const key = `${entry.charName}__${entry.div}`;
        const existing = dedupMap.get(key);
        if (!existing || entry.wins > existing.wins) dedupMap.set(key, entry);
      }
      const allEntries = Array.from(dedupMap.values());

      const uniqueNames = [...new Set(allEntries.map((p) => p.charName))];
      const playerMap = new Map<string, string>();

      for (const name of uniqueNames) {
        const [existingPlayer] = await this.db.select().from(player).where(eq(player.name, name)).limit(1);
        if (existingPlayer) {
          playerMap.set(name, existingPlayer.id);
        } else {
          const info = allEntries.find((p) => p.charName === name)!;
          const [inserted] = await this.db
            .insert(player)
            .values({ name, class: info.class, subClass: info.subClass })
            .returning();
          playerMap.set(name, inserted.id);
        }
      }

      // save playerSnapshot (cumulative totals)
      await this.db.insert(playerSnapshot).values(
        allEntries.map((p) => ({
          snapshotId: snap.id,
          playerId: playerMap.get(p.charName)!,
          division: p.div,
          winsTotal: p.wins,
          killsTotal: p.kills,
          deathsTotal: p.deaths,
          pointsTotal: p.points,
        })),
      );

      // diff against previous snapshot to create arena records
      let arenaMsg = 'sem snapshot anterior (baseline salvo)';
      let arenasCreated: number | null = null;
      if (prevSnap) {
        const { created, seasonReset } = await this.processDelta(snap.id, prevSnap.id, arenaDate, arenaNumber);
        arenasCreated = created;
        arenaMsg = seasonReset
          ? `reset de temporada detectado — primeira arena criada (${created})`
          : `${created} arena(s) criada(s)`;
      }

      await this.db
        .update(syncExecution)
        .set({ status: 'SUCCESS', finishedAt: new Date() })
        .where(eq(syncExecution.id, exec.id));

      return { ok: true, message: `Sync OK — arena ${arenaNumber} de ${arenaDate} · ${arenaMsg}`, arenasCreated };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.db
        .update(syncExecution)
        .set({ status: 'FAILED', errorMessage: message, finishedAt: new Date() })
        .where(eq(syncExecution.id, exec.id));
      return { ok: false, message, arenasCreated: null };
    }
  }

  async resetData(): Promise<{ ok: boolean; message: string }> {
    try {
      await this.db.delete(arenaPlayerResult);
      await this.db.delete(arena);
      await this.db.delete(playerSnapshot);
      await this.db.delete(rawSnapshot);
      await this.db.delete(snapshot);
      await this.db.delete(syncExecution);
      return { ok: true, message: 'Dados resetados. Próxima sync cria novo baseline.' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message };
    }
  }

  async lastSync() {
    const [row] = await this.db
      .select()
      .from(syncExecution)
      .orderBy(desc(syncExecution.startedAt))
      .limit(1);
    return row ?? null;
  }

  async listSnapshots() {
    return this.db
      .select({
        id: snapshot.id,
        arenaDate: snapshot.arenaDate,
        arenaNumber: snapshot.arenaNumber,
        collectedAt: snapshot.collectedAt,
      })
      .from(snapshot)
      .orderBy(desc(snapshot.collectedAt))
      .limit(5);
  }

  async deleteSnapshot(id: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const [latest] = await this.db
        .select({ id: snapshot.id })
        .from(snapshot)
        .orderBy(desc(snapshot.collectedAt))
        .limit(1);

      if (!latest || latest.id !== id) {
        return { ok: false, error: 'Só é permitido apagar o snapshot mais recente.' };
      }

      await this.db.delete(rawSnapshot).where(eq(rawSnapshot.snapshotId, id));
      await this.db.delete(playerSnapshot).where(eq(playerSnapshot.snapshotId, id));
      await this.db.delete(snapshot).where(eq(snapshot.id, id));

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private async fetchRankings(): Promise<RankingsResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch(API_URL, { signal: controller.signal });
      if (!res.ok) throw new Error(`API retornou ${res.status}`);
      return await res.json() as RankingsResponse;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw new Error('Timeout ao buscar dados da API externa (15s)');
      if (err instanceof SyntaxError) throw new Error('Resposta da API não é JSON válido');
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async processDelta(
    snapId: string,
    prevSnapId: string,
    arenaDate: string,
    arenaNumber: number,
  ): Promise<{ created: number; seasonReset: boolean }> {
    const divisions = ['champion', 'aspirant'] as const;
    let created = 0;
    let seasonReset = false;

    for (const div of divisions) {
      const [prevRows, currRows] = await Promise.all([
        this.db.select().from(playerSnapshot).where(and(eq(playerSnapshot.snapshotId, prevSnapId), eq(playerSnapshot.division, div))),
        this.db.select().from(playerSnapshot).where(and(eq(playerSnapshot.snapshotId, snapId), eq(playerSnapshot.division, div))),
      ]);

      const prevMap = new Map(prevRows.map((r) => [r.playerId, r]));
      const isFirstArena = checkSeasonReset(currRows, prevMap);
      if (isFirstArena) seasonReset = true;

      const winners = detectWinners(currRows, prevMap, isFirstArena);

      if (winners.length === 0) continue;

      const [existing] = await this.db
        .select()
        .from(arena)
        .where(and(eq(arena.arenaDate, arenaDate), eq(arena.arenaNumber, arenaNumber), eq(arena.division, div)))
        .limit(1);

      let arenaId: string;
      if (existing) {
        arenaId = existing.id;
        await this.db.delete(arenaPlayerResult).where(eq(arenaPlayerResult.arenaId, arenaId));
        await this.db.update(arena).set({ winnerCount: winners.length }).where(eq(arena.id, arenaId));
      } else {
        const [newArena] = await this.db
          .insert(arena)
          .values({ arenaDate, arenaNumber, division: div, winnerCount: winners.length, status: 'VALID' })
          .returning();
        arenaId = newArena.id;
        created++;
      }

      const zeroPrev = (playerId: string) => ({
        playerId, winsTotal: 0, killsTotal: 0, deathsTotal: 0, pointsTotal: 0,
      });

      await this.db.insert(arenaPlayerResult).values(
        winners.map((cur) => ({
          arenaId,
          playerId: cur.playerId,
          winner: true,
          ...calcDelta(cur, isFirstArena || !prevMap.has(cur.playerId) ? zeroPrev(cur.playerId) : prevMap.get(cur.playerId)!),
        })),
      );
    }

    return { created, seasonReset };
  }
}
