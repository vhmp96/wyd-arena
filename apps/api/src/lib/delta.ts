export interface SnapshotRow {
  playerId: string;
  winsTotal: number;
  killsTotal: number;
  deathsTotal: number;
  pointsTotal: number;
}

export interface WinnerDelta {
  winsDelta: number;
  killsDelta: number;
  deathsDelta: number;
  pointsDelta: number;
}

// Detects season reset by data regression: wins never decrease within a season,
// so any matched player with fewer wins than before signals a full reset.
export function checkSeasonReset(currRows: SnapshotRow[], prevMap: Map<string, SnapshotRow>): boolean {
  return currRows.some((cur) => {
    const prev = prevMap.get(cur.playerId);
    return prev != null && cur.winsTotal < prev.winsTotal;
  });
}

export function detectWinners(
  currRows: SnapshotRow[],
  prevMap: Map<string, SnapshotRow>,
  isFirstArena = false,
): SnapshotRow[] {
  return currRows.filter((cur) => {
    if (isFirstArena) return cur.winsTotal > 0;
    const prev = prevMap.get(cur.playerId);
    if (prev == null) return cur.winsTotal > 0;
    return cur.winsTotal > prev.winsTotal;
  });
}

export function calcDelta(cur: SnapshotRow, prev: SnapshotRow): WinnerDelta {
  return {
    winsDelta: Math.max(0, cur.winsTotal - prev.winsTotal),
    killsDelta: Math.max(0, cur.killsTotal - prev.killsTotal),
    deathsDelta: Math.max(0, cur.deathsTotal - prev.deathsTotal),
    pointsDelta: Math.max(0, cur.pointsTotal - prev.pointsTotal),
  };
}

// Devolve a data/hora "de parede" de São Paulo, não importa o fuso do servidor
// que está rodando. Antes disso era garantido só configurando TZ=America/Sao_Paulo
// no processo Node — mas o Netlify roda tudo em UTC, então precisa ser explícito
// aqui, senão a detecção de qual arena é "a atual" e a data do dia ficam erradas.
export function nowInSaoPaulo(base: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(base);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0';
  const hour = Number(get('hour'));
  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    hour === 24 ? 0 : hour, // o Intl às vezes devolve "24" pra meia-noite
    Number(get('minute')),
    Number(get('second')),
  );
}

export function todayStr(now = nowInSaoPaulo()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function detectCurrentArenaNumber(now = nowInSaoPaulo()): number {
  const total = now.getHours() * 60 + now.getMinutes();
  if (total >= 23 * 60 + 35) return 4;
  if (total >= 21 * 60 + 5) return 3;
  if (total >= 19 * 60 + 35) return 2;
  if (total >= 13 * 60 + 35) return 1;
  return 4;
}
