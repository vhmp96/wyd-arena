CREATE TABLE "level_player" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rank" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"guild" integer,
	"level" integer DEFAULT 0 NOT NULL,
	"level_sub" integer DEFAULT 0 NOT NULL,
	"soma_level" integer DEFAULT 0 NOT NULL,
	"kingdom" varchar(10),
	"guild_mark" varchar(20),
	"sub_class" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
