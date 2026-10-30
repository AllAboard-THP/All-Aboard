import fs from "node:fs/promises";
import path from "node:path";

const MIME_BY_EXTENSION: Record<string, string> = {
  webm: "video/webm",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  mp4: "video/mp4",
};

export type MigrateMessageMediaResult = {
  uploaded: number;
  skipped: number;
  failed: Array<{ key: string; error: string }>;
};

export function guessMessageMediaMimeType(
  attachmentKey: string,
  mimeByKey?: ReadonlyMap<string, string>,
): string {
  const fromDb = mimeByKey?.get(attachmentKey);
  if (fromDb) {
    return fromDb;
  }
  const extension = attachmentKey.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

async function collectFiles(dir: string, out: string[]): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, out);
      continue;
    }
    if (entry.isFile()) {
      out.push(fullPath);
    }
  }
}

/**
 * Copies files already stored on local disk to object storage.
 * Database attachment keys stay unchanged (`{conversationId}/{messageId}.ext`).
 * The S3 object key adds the configured prefix (default `messages/`).
 */
export async function migrateLocalMessageMediaToS3(options: {
  storageDir: string;
  mimeByKey?: ReadonlyMap<string, string>;
  upload: (
    attachmentKey: string,
    body: Buffer,
    mimeType: string,
  ) => Promise<"uploaded" | "skipped">;
}): Promise<MigrateMessageMediaResult> {
  const result: MigrateMessageMediaResult = {
    uploaded: 0,
    skipped: 0,
    failed: [],
  };
  const files: string[] = [];
  await collectFiles(options.storageDir, files);

  for (const filePath of files) {
    const relative = path.relative(options.storageDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      continue;
    }
    const attachmentKey = relative.split(path.sep).join("/");
    try {
      const body = await fs.readFile(filePath);
      const outcome = await options.upload(
        attachmentKey,
        body,
        guessMessageMediaMimeType(attachmentKey, options.mimeByKey),
      );
      if (outcome === "uploaded") {
        result.uploaded += 1;
      } else {
        result.skipped += 1;
      }
    } catch (error) {
      result.failed.push({
        key: attachmentKey,
        error: error instanceof Error ? error.message : "upload_failed",
      });
    }
  }

  return result;
}
