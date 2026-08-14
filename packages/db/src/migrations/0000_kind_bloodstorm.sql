CREATE TABLE "player" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"class" integer NOT NULL,
	"sub_class" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arena" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arena_date" date NOT NULL,
	"arena_number" integer NOT NULL,
	"winner_count" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arena_player_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arena_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"winner" boolean DEFAULT false NOT NULL,
	"wins_delta" integer DEFAULT 0 NOT NULL,
	"kills_delta" integer DEFAULT 0 NOT NULL,
	"deaths_delta" integer DEFAULT 0 NOT NULL,
	"points_delta" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"wins_total" integer DEFAULT 0 NOT NULL,
	"kills_total" integer DEFAULT 0 NOT NULL,
	"deaths_total" integer DEFAULT 0 NOT NULL,
	"points_total" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arena_date" date NOT NULL,
	"arena_number" integer NOT NULL,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_execution" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arena_date" date NOT NULL,
	"arena_number" integer NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "arena_player_result" ADD CONSTRAINT "arena_player_result_arena_id_arena_id_fk" FOREIGN KEY ("arena_id") REFERENCES "public"."arena"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arena_player_result" ADD CONSTRAINT "arena_player_result_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_snapshot" ADD CONSTRAINT "player_snapshot_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_snapshot" ADD CONSTRAINT "player_snapshot_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_snapshot" ADD CONSTRAINT "raw_snapshot_snapshot_id_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE no action ON UPDATE no action;