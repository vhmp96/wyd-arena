import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const seasonRanking = pgTable('season_ranking', {
  id: uuid('id').primaryKey().defaultRandom(),
  month: varchar('month', { length: 7 }).notNull(),       // YYYY-MM
  division: varchar('division', { length: 20 }).notNull(), // champion | aspirant
  rank: integer('rank').notNull(),                         // 1–10
  charName: varchar('char_name', { length: 100 }).notNull(),
  wins: integer('wins').notNull().default(0),
  kills: integer('kills').notNull().default(0),
  deaths: integer('deaths').notNull().default(0),
  points: integer('points').notNull().default(0),
  bonusKill: integer('bonus_kill').notNull().default(0),
  total: integer('total').notNull().default(0),
  consolidatedAt: timestamp('consolidated_at').defaultNow().notNull(),
});
