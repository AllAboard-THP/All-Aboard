import { isNotNull } from "drizzle-orm";

import { createDb, createPool } from "../db/client.js";
import { messages } from "../db/schema.js";
import { readS3MediaConfig } from "../lib/media-storage/config.js";
import { migrateLocalMessageMediaToS3 } from "../lib/media-storage/migrate-local-to-s3.js";
import { getMessageMediaStorageDir } from "../lib/media-storage/paths.js";
import {
  createS3Client,
  uploadObjectIfMissing,
} from "../lib/media-storage/s3-provider.js";

async function loadMimeByKey(): Promise<Map<string, string>> {
  const mimeByKey = new Map<string, string>();
  const pool = createPool();
  if (!pool) {
    console.warn(
      "DATABASE_URL is unset. .webm files fall back to video/webm. Set DATABASE_URL so audio/webm keeps its stored MIME type.",
    );
    return mimeByKey;
  }

  try {
    const db = createDb(pool);
    const rows = await db
      .select({
        key: messages.attachmentKey,
        mime: messages.attachmentMime,
      })
      .from(messages)
      .where(isNotNull(messages.attachmentKey));
    for (const row of rows) {
      if (row.key && row.mime) {
        mimeByKey.set(row.key, row.mime);
      }
    }
  } finally {
    await pool.end();
  }

  return mimeByKey;
}

async function main(): Promise<void> {
  const config = readS3MediaConfig();
  const client = createS3Client(config);
  const mimeByKey = await loadMimeByKey();
  const storageDir = getMessageMediaStorageDir();
  const result = await migrateLocalMessageMediaToS3({
    storageDir,
    mimeByKey,
    upload: (attachmentKey, body, mimeType) =>
      uploadObjectIfMissing(client, config, attachmentKey, body, mimeType),
  });

  console.log(
    JSON.stringify(
      {
        storageDir,
        bucket: config.bucket,
        prefix: config.keyPrefix,
        ...result,
      },
      null,
      2,
    ),
  );

  if (result.failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "migration_failed";
  console.error(message);
  process.exitCode = 1;
});
