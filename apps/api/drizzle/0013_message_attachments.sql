DO $$ BEGIN
  CREATE TYPE "message_kind" AS ENUM ('text', 'audio', 'video');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "attachment_source" AS ENUM ('camera', 'screen', 'microphone');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "message_kind" "message_kind" DEFAULT 'text' NOT NULL;

ALTER TABLE "messages" ALTER COLUMN "body" DROP NOT NULL;

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_key" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_mime" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_size_bytes" integer;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_duration_ms" integer;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachment_source" "attachment_source";

DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_kind_body_attachment_check" CHECK (
    ("message_kind" = 'text' AND "body" IS NOT NULL)
    OR ("message_kind" IN ('audio', 'video') AND "attachment_key" IS NOT NULL)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
