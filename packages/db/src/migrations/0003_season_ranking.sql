CREATE TABLE "season_ranking" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "month" varchar(7) NOT NULL,
  "division" varchar(20) NOT NULL,
  "rank" integer NOT NULL,
  "char_name" varchar(100) NOT NULL,
  "wins" integer DEFAULT 0 NOT NULL,
  "kills" integer DEFAULT 0 NOT NULL,
  "deaths" integer DEFAULT 0 NOT NULL,
  "points" integer DEFAULT 0 NOT NULL,
  "bonus_kill" integer DEFAULT 0 NOT NULL,
  "total" integer DEFAULT 0 NOT NULL,
  "consolidated_at" timestamp DEFAULT now() NOT NULL
);
