import type { ArenaDetail, ArenaStatus, ArenaDiv } from '../types/arena';

export interface ListArenasQueryDto {
  arenaDate?: string;
  arenaNumber?: number;
  division?: ArenaDiv;
  winnerNames?: string[];
}

export interface ListArenasResponseDto {
  data: ArenaListItemDto[];
}

export interface ArenaListItemDto {
  id: string;
  arenaDate: string;
  arenaNumber: number;
  division: ArenaDiv;
  winnerCount: number;
  status: ArenaStatus;
  topPlayer: string | null;
}

export interface GetArenaResponseDto extends ArenaDetail {}
