import { describe, it, expect } from 'vitest';
import {
  checkSeasonReset,
  detectWinners,
  calcDelta,
  detectCurrentArenaNumber,
  todayStr,
  type SnapshotRow,
} from './delta';

// ─── checkSeasonReset ─────────────────────────────────────────────────────────

describe('checkSeasonReset', () => {
  it('retorna false quando todos os wins são iguais ou maiores', () => {
    const curr = [row('p1', 5), row('p2', 3)];
    const prevMap = new Map([['p1', row('p1', 4)], ['p2', row('p2', 3)]]);
    expect(checkSeasonReset(curr, prevMap)).toBe(false);
  });

  it('retorna true quando algum player tem menos wins que antes', () => {
    const curr = [row('p1', 2), row('p2', 1)];
    const prevMap = new Map([['p1', row('p1', 50)], ['p2', row('p2', 30)]]);
    expect(checkSeasonReset(curr, prevMap)).toBe(true);
  });

  it('retorna false quando player novo (sem snapshot anterior)', () => {
    const curr = [row('p1', 3)];
    const prevMap = new Map<string, SnapshotRow>();
    expect(checkSeasonReset(curr, prevMap)).toBe(false);
  });

  it('retorna true mesmo com apenas 1 player com regressão', () => {
    const curr = [row('p1', 5), row('p2', 1)];
    const prevMap = new Map([['p1', row('p1', 4)], ['p2', row('p2', 40)]]);
    expect(checkSeasonReset(curr, prevMap)).toBe(true);
  });
});

// ─── detectWinners ────────────────────────────────────────────────────────────

function row(playerId: string, wins: number, kills = 0, deaths = 0, points = 0): SnapshotRow {
  return { playerId, winsTotal: wins, killsTotal: kills, deathsTotal: deaths, pointsTotal: points };
}

describe('detectWinners', () => {
  it('detecta vencedor quando wins aumentou', () => {
    const curr = [row('p1', 3), row('p2', 1)];
    const prevMap = new Map([['p1', row('p1', 2)], ['p2', row('p2', 1)]]);

    const winners = detectWinners(curr, prevMap);

    expect(winners).toHaveLength(1);
    expect(winners[0].playerId).toBe('p1');
  });

  it('ignora player sem wins novos', () => {
    const curr = [row('p1', 2)];
    const prevMap = new Map([['p1', row('p1', 2)]]);

    expect(detectWinners(curr, prevMap)).toHaveLength(0);
  });

  it('ignora player sem snapshot anterior', () => {
    const curr = [row('p1', 1)];
    const prevMap = new Map<string, SnapshotRow>();

    expect(detectWinners(curr, prevMap)).toHaveLength(0);
  });

  it('detecta múltiplos vencedores na mesma arena', () => {
    const curr = [row('p1', 2), row('p2', 2), row('p3', 1)];
    const prevMap = new Map([
      ['p1', row('p1', 1)],
      ['p2', row('p2', 1)],
      ['p3', row('p3', 1)],
    ]);

    const winners = detectWinners(curr, prevMap);
    expect(winners).toHaveLength(2);
    expect(winners.map((w) => w.playerId)).toEqual(expect.arrayContaining(['p1', 'p2']));
  });
});

// ─── calcDelta ────────────────────────────────────────────────────────────────

describe('calcDelta', () => {
  it('calcula delta de kills, deaths e pontos corretamente', () => {
    const cur = row('p1', 3, 10, 2, 500);
    const prev = row('p1', 2, 7, 1, 350);

    const delta = calcDelta(cur, prev);

    expect(delta.winsDelta).toBe(1);
    expect(delta.killsDelta).toBe(3);
    expect(delta.deathsDelta).toBe(1);
    expect(delta.pointsDelta).toBe(150);
  });

  it('delta nunca é negativo (dados inconsistentes na API)', () => {
    const cur = row('p1', 2, 5, 0, 100);
    const prev = row('p1', 1, 8, 3, 200);

    const delta = calcDelta(cur, prev);

    expect(delta.killsDelta).toBe(0);
    expect(delta.deathsDelta).toBe(0);
    expect(delta.pointsDelta).toBe(0);
  });

  it('delta correto quando player acumula em uma única arena', () => {
    const cur = row('p1', 1, 5, 3, 38);
    const prev = row('p1', 0, 0, 0, 0);

    const delta = calcDelta(cur, prev);

    expect(delta.killsDelta).toBe(5);
    expect(delta.deathsDelta).toBe(3);
    expect(delta.pointsDelta).toBe(38);
  });
});

// ─── detectCurrentArenaNumber ─────────────────────────────────────────────────

describe('detectCurrentArenaNumber', () => {
  function at(h: number, m: number) {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  it('retorna 1 às 13:35 (início exato)', () => {
    expect(detectCurrentArenaNumber(at(13, 35))).toBe(1);
  });

  it('retorna 1 entre 13:35 e 19:34', () => {
    expect(detectCurrentArenaNumber(at(15, 0))).toBe(1);
    expect(detectCurrentArenaNumber(at(19, 34))).toBe(1);
  });

  it('retorna 2 às 19:35 (início exato)', () => {
    expect(detectCurrentArenaNumber(at(19, 35))).toBe(2);
  });

  it('retorna 2 entre 19:35 e 21:04', () => {
    expect(detectCurrentArenaNumber(at(20, 0))).toBe(2);
    expect(detectCurrentArenaNumber(at(21, 4))).toBe(2);
  });

  it('retorna 3 às 21:05 (início exato)', () => {
    expect(detectCurrentArenaNumber(at(21, 5))).toBe(3);
  });

  it('retorna 3 entre 21:05 e 23:34', () => {
    expect(detectCurrentArenaNumber(at(22, 0))).toBe(3);
    expect(detectCurrentArenaNumber(at(23, 34))).toBe(3);
  });

  it('retorna 4 às 23:35 (início exato)', () => {
    expect(detectCurrentArenaNumber(at(23, 35))).toBe(4);
  });

  it('retorna 4 antes das 13:35 (arena do dia anterior)', () => {
    expect(detectCurrentArenaNumber(at(0, 0))).toBe(4);
    expect(detectCurrentArenaNumber(at(13, 34))).toBe(4);
  });
});

// ─── todayStr ─────────────────────────────────────────────────────────────────

describe('todayStr', () => {
  it('retorna data no formato YYYY-MM-DD', () => {
    expect(todayStr(new Date())).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('usa data local, não UTC (evita virada de dia em UTC-3)', () => {
    // Simula 23:35 em UTC-3: UTC seria 02:35 do dia seguinte
    // getFullYear/Month/Date retornam local, então a data deve ser a do servidor
    const d = new Date(2026, 4, 31, 23, 35, 0); // maio 31 local
    expect(todayStr(d)).toBe('2026-05-31');
  });
});
