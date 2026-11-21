-- The help-request outbox stub never publishes on-chain: the column records a stub acknowledgement.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'help_requests' AND column_name = 'intuition_published_at'
  ) THEN
    ALTER TABLE "help_requests" RENAME COLUMN "intuition_published_at" TO "intuition_stub_acked_at";
  END IF;
END $$;
