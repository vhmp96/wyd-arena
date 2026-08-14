import { Hono } from 'hono';
import { desc, eq, and } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { arena, arenaPlayerResult, player, snapshot, rawSnapshot } from '@wyd/db';
import type { RankingsResponse } from '@wyd/shared';

async function getLastArenaDeltas(db: Db, division: 'champion' | 'aspirant'): Promise<Map<string, { killsDelta: number; deathsDelta: number; arenaDate: string; arenaNumber: number }>> {
  const [lastArena] = await db
    .select()
    .from(arena)
    .where(eq(arena.division, division))
    .orderBy(desc(arena.arenaDate), desc(arena.arenaNumber))
    .limit(1);

  if (!lastArena) return new Map();

  const results = await db
    .select({
      charName: player.name,
      killsDelta: arenaPlayerResult.killsDelta,
      deathsDelta: arenaPlayerResult.deathsDelta,
    })
    .from(arenaPlayerResult)
    .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
    .where(and(eq(arenaPlayerResult.arenaId, lastArena.id), eq(arenaPlayerResult.winner, true)));

  return new Map(
    results.map((r) => [r.charName, { killsDelta: r.killsDelta, deathsDelta: r.deathsDelta, arenaDate: lastArena.arenaDate, arenaNumber: lastArena.arenaNumber }])
  );
}

export function createRankingsRoute(db: Db) {
  const app = new Hono();

  app.get('/', async (c) => {
    const [latestRaw] = await db
      .select({ payload: rawSnapshot.payload })
      .from(rawSnapshot)
      .innerJoin(snapshot, eq(rawSnapshot.snapshotId, snapshot.id))
      .orderBy(desc(snapshot.collectedAt))
      .limit(1);

    if (!latestRaw) return c.json({ champion: [], aspirant: [] });

    const data = latestRaw.payload as RankingsResponse;

    const [champDeltas, aspDeltas] = await Promise.all([
      getLastArenaDeltas(db, 'champion'),
      getLastArenaDeltas(db, 'aspirant'),
    ]);

    const enrich = (players: RankingsResponse['champion'], deltas: typeof champDeltas) =>
      players
        .map((p) => {
          const kills = p.kills ?? 0;
          const deaths = p.deaths ?? 0;
          const points = p.points ?? 0;
          const bonusKill = Math.floor(kills / 10);
          return {
            ...p,
            kills,
            deaths,
            points,
            bonusKill,
            total: points + bonusKill,
            lastArena: deltas.get(p.charName),
          };
        })
        .sort((a, b) => b.total - a.total);

    return c.json({ champion: enrich(data.champion, champDeltas), aspirant: enrich(data.aspirant, aspDeltas) });
  });

  return app;
}
