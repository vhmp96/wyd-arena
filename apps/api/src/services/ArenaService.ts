import { eq, and, desc, inArray, exists } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { arena, arenaPlayerResult, player } from '@wyd/db';
import type { ListArenasQueryDto, ArenaListItemDto, GetArenaResponseDto } from '@wyd/shared';

export class ArenaService {
  constructor(private readonly db: Db) {}

  async listArenas(query: ListArenasQueryDto): Promise<ArenaListItemDto[]> {
    const conditions = [];

    if (query.arenaDate) {
      conditions.push(eq(arena.arenaDate, query.arenaDate));
    }

    if (query.arenaNumber !== undefined) {
      conditions.push(eq(arena.arenaNumber, query.arenaNumber));
    }

    if (query.division) {
      conditions.push(eq(arena.division, query.division));
    }

    if (query.winnerNames && query.winnerNames.length > 0) {
      for (const name of query.winnerNames) {
        conditions.push(
          exists(
            this.db
              .select({ id: arenaPlayerResult.id })
              .from(arenaPlayerResult)
              .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
              .where(
                and(
                  eq(arenaPlayerResult.arenaId, arena.id),
                  eq(arenaPlayerResult.winner, true),
                  eq(player.name, name),
                ),
              ),
          ),
        );
      }
    }

    const rows = await this.db
      .select()
      .from(arena)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(arena.arenaDate), desc(arena.arenaNumber));

    const arenaIds = rows.map((r) => r.id);
    const topPlayers = arenaIds.length > 0
      ? await this.db
          .selectDistinctOn([arenaPlayerResult.arenaId], {
            arenaId: arenaPlayerResult.arenaId,
            playerName: player.name,
          })
          .from(arenaPlayerResult)
          .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
          .where(inArray(arenaPlayerResult.arenaId, arenaIds))
          .orderBy(arenaPlayerResult.arenaId, desc(arenaPlayerResult.pointsDelta))
      : [];

    const topMap = new Map(topPlayers.map((t) => [t.arenaId, t.playerName]));

    return rows.map((r) => ({
      id: r.id,
      arenaDate: r.arenaDate,
      arenaNumber: r.arenaNumber,
      division: r.division as ArenaListItemDto['division'],
      winnerCount: r.winnerCount,
      status: r.status as ArenaListItemDto['status'],
      topPlayer: topMap.get(r.id) ?? null,
    }));
  }

  async deleteArena(id: string): Promise<boolean> {
    await this.db.delete(arenaPlayerResult).where(eq(arenaPlayerResult.arenaId, id));
    const deleted = await this.db.delete(arena).where(eq(arena.id, id)).returning();
    return deleted.length > 0;
  }

  // Busca os campeões (vencedores) de uma data + horário de arena específicos,
  // nas duas divisões de uma vez — usado na aba "Campeões" da busca retroativa,
  // pra não precisar entrar em cada arena separadamente só pra ver quem ganhou.
  async getChampions(arenaDate: string, arenaNumber: number) {
    const divisions = ['champion', 'aspirant'] as const;
    const resultado: Record<string, { arenaId: string | null; winners: { playerName: string; killsDelta: number; deathsDelta: number }[] }> = {};

    for (const div of divisions) {
      const [arenaRow] = await this.db
        .select()
        .from(arena)
        .where(and(eq(arena.arenaDate, arenaDate), eq(arena.arenaNumber, arenaNumber), eq(arena.division, div)))
        .limit(1);

      if (!arenaRow) {
        resultado[div] = { arenaId: null, winners: [] };
        continue;
      }

      const winners = await this.db
        .select({
          playerName: player.name,
          killsDelta: arenaPlayerResult.killsDelta,
          deathsDelta: arenaPlayerResult.deathsDelta,
        })
        .from(arenaPlayerResult)
        .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
        .where(and(eq(arenaPlayerResult.arenaId, arenaRow.id), eq(arenaPlayerResult.winner, true)))
        .orderBy(desc(arenaPlayerResult.killsDelta));

      resultado[div] = { arenaId: arenaRow.id, winners };
    }

    return resultado as {
      champion: { arenaId: string | null; winners: { playerName: string; killsDelta: number; deathsDelta: number }[] };
      aspirant: { arenaId: string | null; winners: { playerName: string; killsDelta: number; deathsDelta: number }[] };
    };
  }

  async getArena(id: string): Promise<GetArenaResponseDto | null> {
    const [arenaRow] = await this.db.select().from(arena).where(eq(arena.id, id));
    if (!arenaRow) return null;

    const results = await this.db
      .select({
        id: arenaPlayerResult.id,
        arenaId: arenaPlayerResult.arenaId,
        playerId: arenaPlayerResult.playerId,
        playerName: player.name,
        playerClass: player.class,
        playerSubClass: player.subClass,
        winner: arenaPlayerResult.winner,
        winsDelta: arenaPlayerResult.winsDelta,
        killsDelta: arenaPlayerResult.killsDelta,
        deathsDelta: arenaPlayerResult.deathsDelta,
        pointsDelta: arenaPlayerResult.pointsDelta,
      })
      .from(arenaPlayerResult)
      .innerJoin(player, eq(arenaPlayerResult.playerId, player.id))
      .where(eq(arenaPlayerResult.arenaId, id));

    return {
      id: arenaRow.id,
      arenaDate: arenaRow.arenaDate,
      arenaNumber: arenaRow.arenaNumber,
      division: arenaRow.division as GetArenaResponseDto['division'],
      winnerCount: arenaRow.winnerCount,
      status: arenaRow.status as GetArenaResponseDto['status'],
      createdAt: arenaRow.createdAt.toISOString(),
      players: results,
    };
  }
}
