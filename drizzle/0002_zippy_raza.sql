-- Intentionally a no-op.
-- `poll_results` was already created in 0001_poll_results.sql. An earlier
-- revision of this migration re-ran CREATE TABLE and broke greenfield
-- `drizzle-kit migrate` runs with "relation already exists".
SELECT 1;
