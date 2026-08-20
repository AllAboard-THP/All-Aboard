import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

export function getMessageMediaStorageDir(): string {
  const configured = process.env.MESSAGE_MEDIA_STORAGE_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(apiRoot, configured);
  }
  return path.join(apiRoot, "data", "uploads", "messages");
}

export function messageMediaFilePath(attachmentKey: string): string {
  const normalized = attachmentKey.replace(/^\/+/, "");
  const storageDir = path.resolve(getMessageMediaStorageDir());
  const resolved = path.resolve(storageDir, normalized);
  if (
    resolved !== storageDir &&
    !resolved.startsWith(`${storageDir}${path.sep}`)
  ) {
    throw new Error("invalid_attachment_key");
  }
  return resolved;
}

export async function ensureMessageMediaStorageDir(): Promise<void> {
  await fs.mkdir(getMessageMediaStorageDir(), { recursive: true });
}
