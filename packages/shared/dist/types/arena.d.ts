export type ArenaStatus = 'VALID' | 'INVALID' | 'PENDING';
export type ArenaDiv = 'champion' | 'aspirant';
export interface Arena {
    id: string;
    arenaDate: string;
    arenaNumber: number;
    division: ArenaDiv;
    winnerCount: number;
    status: ArenaStatus;
    createdAt: string;
}
export interface ArenaPlayer {
    id: string;
    arenaId: string;
    playerId: string;
    playerName: string;
    playerClass: number;
    playerSubClass: number;
    winner: boolean;
    winsDelta: number;
    killsDelta: number;
    deathsDelta: number;
    pointsDelta: number;
}
export interface ArenaDetail extends Arena {
    players: ArenaPlayer[];
}
//# sourceMappingURL=arena.d.ts.map