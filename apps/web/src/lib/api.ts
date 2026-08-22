import type {
  ListArenasQueryDto,
  ListArenasResponseDto,
  GetArenaResponseDto,
  RankingsResponse,
  PlayerSearchResult,
  PlayerTimelinePoint,
  TrendingPlayer,
  PeriodRankingEntry,
  RecordsResponse,
  GuildRankingEntry,
} from '@wyd/shared';

// In production VITE_API_URL points to the Railway API service.
// In dev the Vite proxy rewrites /api → localhost:4000, so BASE_URL stays '/api'.
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ? `${import.meta.env.VITE_API_URL as string}`
  : '/api';

function getToken(): string {
  return sessionStorage.getItem('admin_token') ?? '';
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const arenaApi = {
  list(query?: ListArenasQueryDto): Promise<ListArenasResponseDto> {
    const params = new URLSearchParams();
    if (query?.arenaDate) params.set('arenaDate', query.arenaDate);
    if (query?.arenaNumber !== undefined) params.set('arenaNumber', String(query.arenaNumber));
    if (query?.division) params.set('division', query.division);
    if (query?.winnerNames?.length) params.set('winnerNames', query.winnerNames.join(','));
    const qs = params.toString();
    return fetchJson(`${BASE_URL}/arenas${qs ? `?${qs}` : ''}`);
  },
  get(id: string): Promise<GetArenaResponseDto> {
    return fetchJson(`${BASE_URL}/arenas/${id}`);
  },
  async delete(id: string): Promise<{ ok: boolean; error?: string }> {
    const r = await fetch(`${BASE_URL}/arenas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const body = await r.json().catch(() => ({})) as { ok?: boolean; error?: string };
    if (!r.ok) return { ok: false, error: body.error ?? `HTTP ${r.status}` };
    return { ok: true, ...body };
  },
};

export const rankingsApi = {
  get(): Promise<RankingsResponse> {
    return fetchJson(`${BASE_URL}/rankings`);
  },
};

export const playerApi = {
  search(q: string): Promise<PlayerSearchResult[]> {
    return fetchJson(`${BASE_URL}/players/search?q=${encodeURIComponent(q)}`);
  },
  partners(id: string): Promise<{ name: string; winsTogether: number }[]> {
    return fetchJson(`${BASE_URL}/players/${encodeURIComponent(id)}/partners`);
  },
  timeline(id: string): Promise<PlayerTimelinePoint[]> {
    return fetchJson(`${BASE_URL}/players/${encodeURIComponent(id)}/timeline`);
  },
};

export const statsApi = {
  trending(): Promise<TrendingPlayer[]> {
    return fetchJson(`${BASE_URL}/stats/trending`);
  },
  period(range: 'day' | 'week'): Promise<PeriodRankingEntry[]> {
    return fetchJson(`${BASE_URL}/stats/period?range=${range}`);
  },
  records(): Promise<RecordsResponse> {
    return fetchJson(`${BASE_URL}/stats/records`);
  },
};

export interface SyncStatus {
  last: {
    id: string;
    arenaDate: string;
    arenaNumber: number;
    triggeredBy: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
  } | null;
}

export interface SnapshotEntry {
  id: string;
  arenaDate: string;
  arenaNumber: number;
  collectedAt: string;
}

export const syncApi = {
  trigger(): Promise<{ ok: boolean; message: string }> {
    return fetch(`${BASE_URL}/sync/trigger`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.json());
  },
  reset(): Promise<{ ok: boolean; message: string }> {
    return fetch(`${BASE_URL}/sync/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.json());
  },
  recomputeHistory(): Promise<{ ok: boolean; message: string; created: number; updated: number }> {
    return fetch(`${BASE_URL}/sync/recompute-history`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.json());
  },
  status(): Promise<SyncStatus> {
    return fetchJson(`${BASE_URL}/sync/status`);
  },
  listSnapshots(): Promise<{ data: SnapshotEntry[] }> {
    return fetchJson(`${BASE_URL}/sync/snapshots`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
  async deleteSnapshot(id: string): Promise<{ ok: boolean; error?: string }> {
    const r = await fetch(`${BASE_URL}/sync/snapshots/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return r.json();
  },
};

export interface SeasonRankingEntry {
  id: string;
  month: string;
  division: string;
  rank: number;
  charName: string;
  wins: number;
  kills: number;
  deaths: number;
  points: number;
  bonusKill: number;
  total: number;
}

export interface PlayerSeasonHistory {
  top10Count: number;
  top1Count: number;
  history: SeasonRankingEntry[];
}

export const seasonApi = {
  consolidate(): Promise<{ ok: boolean; message: string }> {
    return fetch(`${BASE_URL}/seasons/consolidate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((r) => r.json());
  },
  getPlayerHistory(charName: string): Promise<PlayerSeasonHistory> {
    return fetchJson(`${BASE_URL}/seasons/player/${encodeURIComponent(charName)}`);
  },
};

export interface LevelPlayer {
  id: string;
  rank: number;
  name: string;
  points: number;
  guild: number | null;
  level: number;
  levelSub: number;
  somaLevel: number;
  kingdom: 'blue' | 'red' | null;
  guildMark: string | null;
  subClass: number | null;
}

export const levelApi = {
  list(): Promise<{ data: LevelPlayer[] }> {
    return fetchJson(`${BASE_URL}/level`);
  },
  player(name: string): Promise<LevelPlayer | null> {
    return fetchJson(`${BASE_URL}/level/player/${encodeURIComponent(name)}`);
  },
  guilds(): Promise<{ data: GuildRankingEntry[] }> {
    return fetchJson(`${BASE_URL}/level/guilds`);
  },
  sync(): Promise<{ ok: boolean; message: string }> {
    return fetchJson(`${BASE_URL}/level/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
};

export interface LokiRankPlayer {
  charname: string;
  class: number;
  kingdom: string;
  totalScore: number;
  sumQuest50: number;
  sumQuest51: number;
  sumQuest52: number;
  maxPR: number;
  mountLevel: number;
  mountRefine: number;
  mountTier: number;
  medal: number;
}

export const lokiApi = {
  rank(): Promise<{ players: LokiRankPlayer[] }> {
    return fetchJson(`${BASE_URL}/loki/rank`);
  },
};

export const authApi = {
  async login(password: string): Promise<{ ok: boolean; token?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json() as { token?: string; error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? 'Senha incorreta' };
    return { ok: true, token: data.token };
  },
};
