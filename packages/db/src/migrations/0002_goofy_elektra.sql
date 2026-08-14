ALTER TABLE "sync_execution" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "sync_execution" ALTER COLUMN "started_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "player_snapshot" ADD COLUMN "division" varchar(20) DEFAULT 'champion' NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_execution" ADD COLUMN "triggered_by" varchar(20) DEFAULT 'cron' NOT NULL;--> statement-breakpoint
ALTER TABLE "sync_execution" ADD COLUMN "error_message" varchar(500);