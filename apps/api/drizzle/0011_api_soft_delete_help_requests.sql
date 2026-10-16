ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;

CREATE INDEX IF NOT EXISTS "help_requests_deleted_at_idx" ON "help_requests" ("deleted_at");
