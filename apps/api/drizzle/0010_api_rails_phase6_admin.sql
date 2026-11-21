CREATE TABLE IF NOT EXISTS "denylist_patterns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "label" text NOT NULL,
  "pattern" text NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "flagged_for_moderation" boolean DEFAULT false NOT NULL;
ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "flagged_for_moderation" boolean DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS "help_requests_flagged_for_moderation_idx" ON "help_requests" ("flagged_for_moderation");
CREATE INDEX IF NOT EXISTS "responses_flagged_for_moderation_idx" ON "responses" ("flagged_for_moderation");
