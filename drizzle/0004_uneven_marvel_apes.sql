ALTER TABLE "assessments" ADD CONSTRAINT "assessments_score_non_negative" CHECK ("assessments"."score" >= 0);--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_max_score_positive" CHECK ("assessments"."max_score" >= 1);--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_score_lte_max_score" CHECK ("assessments"."score" <= "assessments"."max_score");--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_percentage_between_0_and_100" CHECK ("assessments"."percentage" >= 0 AND "assessments"."percentage" <= 100);--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_time_taken_non_negative" CHECK ("assessments"."time_taken" >= 0);--> statement-breakpoint
ALTER TABLE "poll_results" ADD CONSTRAINT "poll_results_vote_count_non_negative" CHECK ("poll_results"."vote_count" >= 0);--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_target_score_between_0_and_100" CHECK ("settings"."target_score" >= 0 AND "settings"."target_score" <= 100);