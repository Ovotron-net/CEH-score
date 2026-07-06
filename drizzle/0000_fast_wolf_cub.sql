<<<<<<< Updated upstream
CREATE TABLE "assessments"
(
    "id"         text PRIMARY KEY NOT NULL,
    "date"       text             NOT NULL,
    "type"       text             NOT NULL,
    "score"      integer          NOT NULL,
    "max_score"  integer          NOT NULL,
    "percentage" double precision NOT NULL,
    "time_taken" integer          NOT NULL,
    "domain"     text             NOT NULL,
    "notes"      text DEFAULT ''  NOT NULL,
    "passed"     boolean          NOT NULL,
    "created_at" text             NOT NULL
);
--> statement-breakpoint
=======
<<<<<<< HEAD
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"percentage" double precision NOT NULL,
	"time_taken" integer NOT NULL,
	"domain" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"passed" boolean NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Alex Chen' NOT NULL,
	"target_score" integer DEFAULT 85 NOT NULL,
	"exam_date" text DEFAULT '' NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL
=======
CREATE TABLE "assessments"
(
    "id"         text PRIMARY KEY NOT NULL,
    "date"       text             NOT NULL,
    "type"       text             NOT NULL,
    "score"      integer          NOT NULL,
    "max_score"  integer          NOT NULL,
    "percentage" double precision NOT NULL,
    "time_taken" integer          NOT NULL,
    "domain"     text             NOT NULL,
    "notes"      text DEFAULT ''  NOT NULL,
    "passed"     boolean          NOT NULL,
    "created_at" text             NOT NULL
);
--> statement-breakpoint
>>>>>>> Stashed changes
CREATE TABLE "settings"
(
    "id"           serial PRIMARY KEY          NOT NULL,
    "name"         text    DEFAULT 'Alex Chen' NOT NULL,
    "target_score" integer DEFAULT 85          NOT NULL,
    "exam_date"    text    DEFAULT ''          NOT NULL,
    "theme"        text    DEFAULT 'dark'      NOT NULL
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
);
