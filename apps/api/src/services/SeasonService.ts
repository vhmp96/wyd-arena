import { eq, and, desc } from 'drizzle-orm';
import type { Db } from '@wyd/db';
import { seasonRanking } from '@wyd/db';
import type { RankingsResponse } from '@wyd/shared';
import { nowInSaoPaulo } from '../lib/delta';

const API_URL = 'https://mochila.tapiocahut.com/royal-arena';

function currentMonth(): string {
  const now = nowInSaoPaulo();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function isLastDayOfMonth(): boolean {
  const now = nowInSaoPaulo();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDate() === 1;
}

export class SeasonService {
  constructor(private readonly db: Db) {}

  async consolidate(): Promise<{ ok: boolean; message: string }> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      let data: RankingsResponse;
      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`API retornou ${res.status}`);
        data = await res.json() as RankingsResponse;
      } finally {
        clearTimeout(timeout);
      }

      const month = currentMonth();

      const enrich = (players: RankingsResponse['champion']) =>
        players
          .map((p) => {
            const bonusKill = Math.floor(p.kills / 10);
            return { ...p, bonusKill, total: p.points + bonusKill };
          })
          .sort((a, b) => b.total - a.total);

      const champTop10 = enrich(data.champion);
      const aspTop10 = enrich(data.aspirant);

      // delete existing consolidation for this month (idempotent)
      await this.db.delete(seasonRanking).where(eq(seasonRanking.month, month));

      await this.db.insert(seasonRanking).values([
        ...champTop10.map((p, i) => ({
          month, division: 'champion', rank: i + 1,
          charName: p.charName, wins: p.wins, kills: p.kills,
          deaths: p.deaths, points: p.points, bonusKill: p.bonusKill, total: p.total,
        })),
        ...aspTop10.map((p, i) => ({
          month, division: 'aspirant', rank: i + 1,
          charName: p.charName, wins: p.wins, kills: p.kills,
          deaths: p.deaths, points: p.points, bonusKill: p.bonusKill, total: p.total,
        })),
      ]);

      return { ok: true, message: `Temporada ${month} consolidada (${champTop10.length} champion + ${aspTop10.length} aspirant).` };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, message };
    }
  }

  async getPlayerSeasonHistory(charName: string) {
    const rows = await this.db
      .select()
      .from(seasonRanking)
      .where(eq(seasonRanking.charName, charName))
      .orderBy(desc(seasonRanking.month), seasonRanking.division);

    const top10Count = rows.filter((r) => r.rank <= 10).length;
    const top1Count = rows.filter((r) => r.rank === 1).length;

    return { top10Count, top1Count, history: rows };
  }

  async getSeasonTop10(month: string) {
    return this.db
      .select()
      .from(seasonRanking)
      .where(eq(seasonRanking.month, month))
      .orderBy(seasonRanking.division, seasonRanking.rank);
  }

  shouldRunCron(): boolean {
    return isLastDayOfMonth();
  }
}
