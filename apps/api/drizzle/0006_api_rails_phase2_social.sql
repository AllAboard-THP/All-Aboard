CREATE TABLE IF NOT EXISTS "likes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "help_request_id" uuid NOT NULL REFERENCES "help_requests"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "likes_user_help_request_unique"
  ON "likes" ("user_id", "help_request_id");

CREATE TABLE IF NOT EXISTS "bookmarks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "help_request_id" uuid NOT NULL REFERENCES "help_requests"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "bookmarks_user_help_request_unique"
  ON "bookmarks" ("user_id", "help_request_id");

CREATE INDEX IF NOT EXISTS "likes_help_request_id_idx" ON "likes" ("help_request_id");
CREATE INDEX IF NOT EXISTS "bookmarks_help_request_id_idx" ON "bookmarks" ("help_request_id");
CREATE INDEX IF NOT EXISTS "help_requests_author_id_idx" ON "help_requests" ("author_id");
