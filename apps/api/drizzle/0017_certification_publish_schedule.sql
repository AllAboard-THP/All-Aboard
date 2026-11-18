-- Slice 2 (#180): retry schedule for publishing +1s on Intuition.
ALTER TABLE "certifications" ADD COLUMN "next_publish_at" timestamp with time zone;
