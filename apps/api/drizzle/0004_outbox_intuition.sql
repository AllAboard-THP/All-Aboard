ALTER TABLE "help_requests" ADD COLUMN IF NOT EXISTS "intuition_published_at" timestamp with time zone;

CREATE TABLE IF NOT EXISTS "outbox_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_type" text NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "processed_at" timestamp with time zone
);

CREATE UNIQUE INDEX IF NOT EXISTS "outbox_events_type_aggregate_unique"
  ON "outbox_events" ("event_type", "aggregate_id");

CREATE INDEX IF NOT EXISTS "outbox_events_unprocessed_idx"
  ON "outbox_events" ("created_at")
  WHERE "processed_at" IS NULL;
