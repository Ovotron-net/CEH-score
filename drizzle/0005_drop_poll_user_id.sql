DROP INDEX IF EXISTS "user_id_idx";
--> statement-breakpoint
ALTER TABLE "poll_results" DROP COLUMN IF EXISTS "user_id";
