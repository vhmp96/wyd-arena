import { ilike, eq, desc, asc, inArray, and, not } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { player, arenaPlayerResult, arena, playerSnapshot, snapshot } from '@wyd/db';
import type { PlayerSearchResult, PlayerTimelinePoint } from '@wyd/shared';
import { buildArenaPositions, computeStreaks } from '../lib/streaks';

export class PlayerService {
  constructor(private readonly db: Db) {}

  async searchPlayers(q: string): Promise<PlayerSearchResult[]> {
    const players = await this.db
      .select()
      .from(player)
      .where(ilike(player.name, `%${q}%`))
      .limit(20);

    if (players.length === 0) return [];

    const playerIds = players.map((p) => p.id);

    const rows = await this.db
      .select({
        playerId: arenaPlayerResult.playerId,
        arenaId: arenaPlayerResult.arenaId,
        arenaDate: arena.arenaDate,
        arenaNumber: arena.arenaNumber,
        winner: arenaPlayerResult.winner,
        kills: arenaPlayerResult.killsDelta,
        deaths: arenaPlayerResult.deathsDelta,
        wins: arenaPlayerResult.winsDelta,
        points: arenaPlayerResult.pointsDelta,
      })
      .from(arenaPlayerResult)
      .innerJoin(arena, eq(arenaPlayerResult.arenaId, arena.id))
      .where(inArray(arenaPlayerResult.playerId, playerIds))
      .orderBy(desc(arena.arenaDate), desc(arena.arenaNumber));

    const rowsByPlayer = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = rowsByPlayer.get(row.playerId) ?? [];
      list.push(row);
      rowsByPlayer.set(row.playerId, list);
    }

    // Build per-division ordered arena timeline for streak calculation.
    const allArenas = await this.db
      .select({ id: arena.id, division: arena.division })
      .from(arena)
      .orderBy(asc(arena.arenaDate), asc(arena.arenaNumber));

    const { arenaDiv, posByDiv } = buildArenaPositions(allArenas);

    return players.map((p) => {
      const history = rowsByPlayer.get(p.id) ?? [];
      const wonArenaIds = history.filter((r) => r.winner).map((r) => r.arenaId);
      const { current, best } = computeStreaks(wonArenaIds, arenaDiv, posByDiv);
      return {
        id: p.id,
        name: p.name,
        class: p.class,
        subClass: p.subClass,
        totalArenas: history.length,
        totalWins: history.filter((r) => r.winner).length,
        totalKills: history.reduce((s, r) => s + r.kills, 0),
        totalDeaths: history.reduce((s, r) => s + r.deaths, 0),
        currentStreak: current,
        bestStreak: best,
        history,
      };
    });
  }

  // Returns the cumulative-stat time series for a player from playerSnapshot,
  // used to render the evolution chart on the player card.
  async getTimeline(playerId: string): Promise<PlayerTimelinePoint[]> {
    const rows = await this.db
      .select({
        collectedAt: snapshot.collectedAt,
        arenaDate: snapshot.arenaDate,
        arenaNumber: snapshot.arenaNumber,
        division: playerSnapshot.division,
        winsTotal: playerSnapshot.winsTotal,
        killsTotal: playerSnapshot.killsTotal,
        deathsTotal: playerSnapshot.deathsTotal,
        pointsTotal: playerSnapshot.pointsTotal,
      })
      .from(playerSnapshot)
      .innerJoin(snapshot, eq(playerSnapshot.snapshotId, snapshot.id))
      .where(eq(playerSnapshot.playerId, playerId))
      .orderBy(asc(snapshot.collectedAt));

    return rows.map((r) => ({
      collectedAt: r.collectedAt.toISOString(),
      arenaDate: r.arenaDate,
      arenaNumber: r.arenaNumber,
      division: r.division as PlayerTimelinePoint['division'],
      winsTotal: r.winsTotal,
      killsTotal: r.killsTotal,
      deathsTotal: r.deathsTotal,
      pointsTotal: r.pointsTotal,
    }));
  }

  async getTopPartners(playerId: string, limit = 5): Promise<{ name: string; winsTogether: number }[]> {
    const wins = await this.db
      .select({ arenaId: arenaPlayerResult.arenaId })
      .from(arenaPlayerResult)
      .where(and(eq(arenaPlayerResult.playerId, playerId), eq(arenaPlayerResult.winner, true)));

    if (wins.length === 0) return [];

    const arenaIds = wins.map((r) => r.arenaId);

    const cowinners = await this.db
      .select({ name: player.name })
      .from(arenaPlayerResult)
      .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
      .where(and(
        inArray(arenaPlayerResult.arenaId, arenaIds),
        eq(arenaPlayerResult.winner, true),
        not(eq(arenaPlayerResult.playerId, playerId)),
      ));

    const counts = new Map<string, number>();
    for (const { name } of cowinners) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([name, winsTogether]) => ({ name, winsTogether }))
      .sort((a, b) => b.winsTogether - a.winsTogether)
      .slice(0, limit);
  }
}
