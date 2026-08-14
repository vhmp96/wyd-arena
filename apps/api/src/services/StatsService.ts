import { desc, asc, eq, gte, lte, sql } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { player, playerSnapshot, snapshot, arena, arenaPlayerResult, seasonRanking } from '@wyd/db';
import type { TrendingPlayer, PeriodRankingEntry, RecordsResponse, RecordEntry, ArenaDiv } from '@wyd/shared';
import { buildArenaPositions, computeStreaks } from '../lib/streaks';

const DAY_MS = 24 * 60 * 60 * 1000;

export class StatsService {
  constructor(private readonly db: Db) {}

  // Players with the biggest point gains over the last ~7 days, comparing the
  // latest snapshot against the snapshot closest to 7 days earlier.
  async getTrending(limit = 15): Promise<TrendingPlayer[]> {
    const [latest] = await this.db
      .select()
      .from(snapshot)
      .orderBy(desc(snapshot.collectedAt))
      .limit(1);
    if (!latest) return [];

    const cutoff = new Date(latest.collectedAt.getTime() - 7 * DAY_MS);
    let [past] = await this.db
      .select()
      .from(snapshot)
      .where(lte(snapshot.collectedAt, cutoff))
      .orderBy(desc(snapshot.collectedAt))
      .limit(1);
    if (!past) {
      [past] = await this.db
        .select()
        .from(snapshot)
        .orderBy(asc(snapshot.collectedAt))
        .limit(1);
    }
    if (!past || past.id === latest.id) return [];

    const rowsFor = (snapId: string) =>
      this.db
        .select({
          name: player.name,
          division: playerSnapshot.division,
          points: playerSnapshot.pointsTotal,
          kills: playerSnapshot.killsTotal,
          wins: playerSnapshot.winsTotal,
        })
        .from(playerSnapshot)
        .innerJoin(player, eq(playerSnapshot.playerId, player.id))
        .where(eq(playerSnapshot.snapshotId, snapId));

    const [latestRows, pastRows] = await Promise.all([rowsFor(latest.id), rowsFor(past.id)]);

    const pastMap = new Map(pastRows.map((r) => [`${r.name}__${r.division}`, r]));

    const trending: TrendingPlayer[] = [];
    for (const r of latestRows) {
      const prev = pastMap.get(`${r.name}__${r.division}`);
      const pointsGained = r.points - (prev?.points ?? 0);
      const killsGained = r.kills - (prev?.kills ?? 0);
      const winsGained = r.wins - (prev?.wins ?? 0);
      if (pointsGained <= 0 && winsGained <= 0) continue;
      trending.push({
        charName: r.name,
        division: r.division as ArenaDiv,
        pointsGained,
        killsGained,
        winsGained,
        pointsNow: r.points,
      });
    }

    return trending.sort((a, b) => b.pointsGained - a.pointsGained).slice(0, limit);
  }

  // Aggregated arena performance over the most recent day or last 7 days.
  async getPeriodRanking(range: 'day' | 'week', limit = 50): Promise<PeriodRankingEntry[]> {
    const [latestArena] = await this.db
      .select({ d: arena.arenaDate })
      .from(arena)
      .orderBy(desc(arena.arenaDate))
      .limit(1);
    if (!latestArena) return [];

    let cutoff = latestArena.d;
    if (range === 'week') {
      const dt = new Date(`${latestArena.d}T00:00:00Z`);
      dt.setUTCDate(dt.getUTCDate() - 6);
      cutoff = dt.toISOString().slice(0, 10);
    }

    const rows = await this.db
      .select({
        name: player.name,
        division: arena.division,
        wins: arenaPlayerResult.winsDelta,
        kills: arenaPlayerResult.killsDelta,
        deaths: arenaPlayerResult.deathsDelta,
        points: arenaPlayerResult.pointsDelta,
      })
      .from(arenaPlayerResult)
      .innerJoin(arena, eq(arenaPlayerResult.arenaId, arena.id))
      .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
      .where(gte(arena.arenaDate, cutoff));

    const agg = new Map<string, PeriodRankingEntry>();
    for (const r of rows) {
      const key = `${r.name}__${r.division}`;
      const cur = agg.get(key) ?? {
        charName: r.name,
        division: r.division as ArenaDiv,
        wins: 0,
        kills: 0,
        deaths: 0,
        points: 0,
      };
      cur.wins += r.wins;
      cur.kills += r.kills;
      cur.deaths += r.deaths;
      cur.points += r.points;
      agg.set(key, cur);
    }

    return Array.from(agg.values())
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .slice(0, limit);
  }

  async getRecords(limit = 10): Promise<RecordsResponse> {
    const mostKillsRows = await this.db
      .select({
        name: seasonRanking.charName,
        month: seasonRanking.month,
        kills: seasonRanking.kills,
        division: seasonRanking.division,
      })
      .from(seasonRanking)
      .orderBy(desc(seasonRanking.kills))
      .limit(limit);

    const mostKillsSeason: RecordEntry[] = mostKillsRows.map((r) => ({
      charName: r.name,
      value: r.kills,
      detail: `${r.month} · ${r.division}`,
    }));

    const mostDeathsRows = await this.db
      .select({
        name: seasonRanking.charName,
        month: seasonRanking.month,
        deaths: seasonRanking.deaths,
        division: seasonRanking.division,
      })
      .from(seasonRanking)
      .orderBy(desc(seasonRanking.deaths))
      .limit(limit);

    const mostDeathsSeason: RecordEntry[] = mostDeathsRows.map((r) => ({
      charName: r.name,
      value: r.deaths,
      detail: `${r.month} · ${r.division}`,
    }));

    const mostWinsRows = await this.db
      .select({
        name: player.name,
        arenaDate: arena.arenaDate,
        c: sql<number>`count(*)::int`,
      })
      .from(arenaPlayerResult)
      .innerJoin(arena, eq(arenaPlayerResult.arenaId, arena.id))
      .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
      .where(eq(arenaPlayerResult.winner, true))
      .groupBy(arenaPlayerResult.playerId, player.name, arena.arenaDate)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const mostWinsInDay: RecordEntry[] = mostWinsRows.map((r) => ({
      charName: r.name,
      value: r.c,
      detail: r.arenaDate,
    }));

    // Longest streaks: rebuild per-division arena positions, then compute best
    // streak per player from their winning arenas.
    const allArenas = await this.db
      .select({ id: arena.id, division: arena.division })
      .from(arena)
      .orderBy(asc(arena.arenaDate), asc(arena.arenaNumber));
    const { arenaDiv, posByDiv } = buildArenaPositions(allArenas);

    const winnerRows = await this.db
      .select({ name: player.name, arenaId: arenaPlayerResult.arenaId })
      .from(arenaPlayerResult)
      .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
      .where(eq(arenaPlayerResult.winner, true));

    const wonByPlayer = new Map<string, string[]>();
    for (const r of winnerRows) {
      const arr = wonByPlayer.get(r.name) ?? [];
      arr.push(r.arenaId);
      wonByPlayer.set(r.name, arr);
    }

    const longestStreak: RecordEntry[] = Array.from(wonByPlayer.entries())
      .map(([name, ids]) => ({
        charName: name,
        value: computeStreaks(ids, arenaDiv, posByDiv).best,
        detail: '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);

    return { mostKillsSeason, longestStreak, mostWinsInDay, mostDeathsSeason };
  }
}
