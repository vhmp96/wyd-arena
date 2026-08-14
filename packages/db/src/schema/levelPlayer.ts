import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const levelPlayer = pgTable('level_player', {
  id: uuid('id').primaryKey().defaultRandom(),
  rank: integer('rank').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  points: integer('points').notNull().default(0),
  guild: integer('guild'),
  level: integer('level').notNull().default(0),
  levelSub: integer('level_sub').notNull().default(0),
  somaLevel: integer('soma_level').notNull().default(0),
  kingdom: varchar('kingdom', { length: 10 }),
  guildMark: varchar('guild_mark', { length: 20 }),
  subClass: integer('sub_class'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
