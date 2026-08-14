import { asc } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { levelPlayer } from '@wyd/db';
import type { GuildRankingEntry } from '@wyd/shared';

const LEVEL_API_URL = 'https://mochila.tapiocahut.com/component-rank';

interface RawLevelPlayer {
  name: string;
  points: number;
  guild: number | null;
  level: number | null;
  levelSub: number | null;
  'Soma Level': number | null;
  kingdom: string | null;
  guildMark: string | null;
  subClass: number | null;
}

export class LevelService {
  constructor(private readonly db: Db) {}

  async sync(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(LEVEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: {} }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`Level API retornou ${res.status}`);

      const raw = (await res.json()) as RawLevelPlayer[];

      const valid = raw
        .filter((p) => p.name && (p['Soma Level'] ?? 0) > 0)
        .slice(0, 500);

      await this.db.delete(levelPlayer);

      if (valid.length > 0) {
        await this.db.insert(levelPlayer).values(
          valid.map((p, i) => ({
            rank: i + 1,
            name: p.name,
            points: p.points ?? 0,
            guild: p.guild ?? null,
            level: p.level ?? 0,
            levelSub: p.levelSub ?? 0,
            somaLevel: p['Soma Level'] ?? 0,
            kingdom: p.kingdom ?? null,
            guildMark: p.guildMark ?? null,
            subClass: p.subClass ?? null,
          })),
        );
      }

      return { ok: true, message: `${valid.length} players sincronizados` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { ok: false, message: msg };
    }
  }

  async list() {
    return this.db
      .select()
      .from(levelPlayer)
      .orderBy(asc(levelPlayer.rank));
  }

  // Aggregates the level ranking (top 500) by guild mark, producing a guild
  // leaderboard based on how many top members each guild has and their average level.
  async getGuildRanking(): Promise<GuildRankingEntry[]> {
    const players = await this.list();

    const byGuild = new Map<
      string,
      { kingdom: string | null; total: number; count: number; topMember: string; topMemberLevel: number }
    >();

    for (const p of players) {
      if (!p.guildMark) continue;
      const g = byGuild.get(p.guildMark) ?? {
        kingdom: p.kingdom,
        total: 0,
        count: 0,
        topMember: p.name,
        topMemberLevel: p.somaLevel,
      };
      g.total += p.somaLevel;
      g.count += 1;
      if (p.somaLevel > g.topMemberLevel) {
        g.topMember = p.name;
        g.topMemberLevel = p.somaLevel;
      }
      byGuild.set(p.guildMark, g);
    }

    return Array.from(byGuild.entries())
      .map(([guildMark, g]) => ({
        guildMark,
        kingdom: g.kingdom,
        memberCount: g.count,
        avgSomaLevel: Math.round(g.total / g.count),
        topMember: g.topMember,
        topMemberLevel: g.topMemberLevel,
      }))
      .sort((a, b) => b.memberCount - a.memberCount || b.avgSomaLevel - a.avgSomaLevel);
  }
}
