import { pgTable, uuid, date, integer, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { player } from './player';

export const snapshot = pgTable('snapshot', {
  id: uuid('id').primaryKey().defaultRandom(),
  arenaDate: date('arena_date').notNull(),
  arenaNumber: integer('arena_number').notNull(),
  collectedAt: timestamp('collected_at').defaultNow().notNull(),
});

export const playerSnapshot = pgTable('player_snapshot', {
  id: uuid('id').primaryKey().defaultRandom(),
  snapshotId: uuid('snapshot_id').notNull().references(() => snapshot.id),
  playerId: uuid('player_id').notNull().references(() => player.id),
  division: varchar('division', { length: 20 }).notNull().default('champion'),
  winsTotal: integer('wins_total').notNull().default(0),
  killsTotal: integer('kills_total').notNull().default(0),
  deathsTotal: integer('deaths_total').notNull().default(0),
  pointsTotal: integer('points_total').notNull().default(0),
});

export const rawSnapshot = pgTable('raw_snapshot', {
  id: uuid('id').primaryKey().defaultRandom(),
  snapshotId: uuid('snapshot_id').notNull().references(() => snapshot.id),
  payload: jsonb('payload').notNull(),
});
