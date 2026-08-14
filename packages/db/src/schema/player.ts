import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const player = pgTable('player', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  class: integer('class').notNull(),
  subClass: integer('sub_class').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
