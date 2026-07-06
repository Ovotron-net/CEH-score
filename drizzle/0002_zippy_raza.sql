<<<<<<< Updated upstream
=======
<<<<<<< HEAD
CREATE TABLE "poll_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"poll_id" text NOT NULL,
	"poll_question" text NOT NULL,
	"option_text" text NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
=======
>>>>>>> Stashed changes
CREATE TABLE "poll_results"
(
    "id"            serial PRIMARY KEY      NOT NULL,
    "poll_id"       text                    NOT NULL,
    "poll_question" text                    NOT NULL,
    "option_text"   text                    NOT NULL,
    "vote_count"    integer   DEFAULT 0     NOT NULL,
    "user_id"       text,
    "created_at"    timestamp DEFAULT now() NOT NULL,
    "updated_at"    timestamp DEFAULT now() NOT NULL
<<<<<<< Updated upstream
=======
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
);
