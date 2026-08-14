import { pgTable, uuid, date, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const arena = pgTable('arena', {
  id: uuid('id').primaryKey().defaultRandom(),
  arenaDate: date('arena_date').notNull(),
  arenaNumber: integer('arena_number').notNull(),
  division: varchar('division', { length: 20 }).notNull().default('champion'),
  winnerCount: integer('winner_count').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
