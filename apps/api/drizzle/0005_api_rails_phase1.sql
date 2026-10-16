DO $$ BEGIN
  CREATE TYPE "help_request_status" AS ENUM ('open', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "subjects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "icon" text DEFAULT 'book' NOT NULL,
  "accent_color" text DEFAULT '#6366f1' NOT NULL,
  "description" text,
  "posts_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "subjects_slug_unique" ON "subjects" ("slug");

ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "body" text DEFAULT '' NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "code_snippet" text;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "code_language" text DEFAULT 'plaintext';
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "urgent" boolean DEFAULT false NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "status" "help_request_status" DEFAULT 'open' NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "mentor_help_requested" boolean DEFAULT false NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "subject_id" uuid REFERENCES "subjects"("id") ON DELETE SET NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "education_level" text;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "ai_summary" text;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "likes_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "responses_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "bookmarks_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "code_snippet" text;
ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "code_language" text;

CREATE INDEX IF NOT EXISTS "help_requests_subject_id_idx" ON "help_requests" ("subject_id");
CREATE INDEX IF NOT EXISTS "help_requests_status_idx" ON "help_requests" ("status");
