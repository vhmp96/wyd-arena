import { pgTable, uuid, date, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const syncExecution = pgTable('sync_execution', {
  id: uuid('id').primaryKey().defaultRandom(),
  arenaDate: date('arena_date').notNull(),
  arenaNumber: integer('arena_number').notNull(),
  triggeredBy: varchar('triggered_by', { length: 20 }).notNull().default('cron'),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  errorMessage: varchar('error_message', { length: 500 }),
  retryCount: integer('retry_count').notNull().default(0),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
});
