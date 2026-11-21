ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "certification_tags" text[] DEFAULT '{}' NOT NULL;
