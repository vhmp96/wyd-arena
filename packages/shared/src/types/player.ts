import type { ArenaDiv } from './arena';

export interface Player {
  id: string;
  name: string;
  class: number;
  subClass: number;
  createdAt: string;
  updatedAt: string;
}

export interface RankingPlayer {
  charName: string;
  class: number;
  subClass: number;
  wins: number;
  kills: number;
  deaths: number;
  points: number;
  bonusKill: number;
  total: number;
  lastArena?: { killsDelta: number; deathsDelta: number; winner: boolean; arenaDate: string; arenaNumber: number };
}

export interface RankingsResponse {
  champion: RankingPlayer[];
  aspirant: RankingPlayer[];
}

export interface PlayerArenaResult {
  arenaId: string;
  arenaDate: string;
  arenaNumber: number;
  winner: boolean;
  kills: number;
  deaths: number;
  wins: number;
  points: number;
}

export interface PlayerSearchResult {
  id: string;
  name: string;
  class: number;
  subClass: number;
  totalArenas: number;
  totalWins: number;
  totalKills: number;
  totalDeaths: number;
  currentStreak: number;
  bestStreak: number;
  history: PlayerArenaResult[];
}

export interface PlayerTimelinePoint {
  collectedAt: string;
  arenaDate: string;
  arenaNumber: number;
  division: ArenaDiv;
  winsTotal: number;
  killsTotal: number;
  deathsTotal: number;
  pointsTotal: number;
}

export interface TrendingPlayer {
  charName: string;
  division: ArenaDiv;
  pointsGained: number;
  killsGained: number;
  winsGained: number;
  pointsNow: number;
}

export interface PeriodRankingEntry {
  charName: string;
  division: ArenaDiv;
  wins: number;
  kills: number;
  deaths: number;
  points: number;
}

export interface RecordEntry {
  charName: string;
  value: number;
  detail: string;
}

export interface RecordsResponse {
  mostKillsSeason: RecordEntry[];
  longestStreak: RecordEntry[];
  mostWinsInDay: RecordEntry[];
  mostDeathsSeason: RecordEntry[];
}

export interface GuildRankingEntry {
  guildMark: string;
  kingdom: string | null;
  memberCount: number;
  avgSomaLevel: number;
  topMember: string;
  topMemberLevel: number;
}
