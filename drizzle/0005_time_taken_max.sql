ALTER TABLE "assessments" ADD CONSTRAINT "assessments_time_taken_max" CHECK ("assessments"."time_taken" <= 10080);
