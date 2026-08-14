import { pgTable, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { arena } from './arena';
import { player } from './player';

export const arenaPlayerResult = pgTable('arena_player_result', {
  id: uuid('id').primaryKey().defaultRandom(),
  arenaId: uuid('arena_id').notNull().references(() => arena.id),
  playerId: uuid('player_id').notNull().references(() => player.id),
  winner: boolean('winner').notNull().default(false),
  winsDelta: integer('wins_delta').notNull().default(0),
  killsDelta: integer('kills_delta').notNull().default(0),
  deathsDelta: integer('deaths_delta').notNull().default(0),
  pointsDelta: integer('points_delta').notNull().default(0),
});
