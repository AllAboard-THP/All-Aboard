import fs from "node:fs/promises";
import path from "node:path";

import { getMessageMediaStorageMode, readS3MediaConfig } from "./config.js";
import {
  buildAttachmentKey,
  createLocalMediaStorageProvider,
} from "./local-provider.js";
import {
  getMessageMediaStorageDir,
  messageMediaFilePath,
} from "./paths.js";
import {
  createS3MediaStorageFromEnv,
  verifyS3MediaStorageAccess,
} from "./s3-provider.js";
import type { MediaStorageProvider } from "./types.js";

export { getMessageMediaStorageMode, readS3MediaConfig } from "./config.js";
export type { MessageMediaStorageMode, S3MediaConfig } from "./config.js";
export { buildAttachmentKey, extensionForMimeType } from "./local-provider.js";
export {
  ensureMessageMediaStorageDir,
  getMessageMediaStorageDir,
  messageMediaFilePath,
  normalizeAttachmentKey,
} from "./paths.js";
export type { MediaStorageProvider, SaveMessageMediaParams } from "./types.js";

export const localMediaStorageProvider = {
  async save(
    conversationId: string,
    messageId: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    const key = buildAttachmentKey(conversationId, messageId, mimeType);
    const filePath = messageMediaFilePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return key;
  },

  async delete(key: string): Promise<void> {
    const filePath = messageMediaFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  },
};

let provider: MediaStorageProvider | null = null;
let cachedMode: "local" | "s3" | null = null;

export function getMediaStorage(): MediaStorageProvider {
  const mode = getMessageMediaStorageMode();
  if (!provider || cachedMode !== mode) {
    provider =
      mode === "s3"
        ? createS3MediaStorageFromEnv()
        : createLocalMediaStorageProvider(getMessageMediaStorageDir);
    cachedMode = mode;
  }
  return provider;
}

/** Fails fast at boot when S3 mode is selected but credentials are missing. */
export function assertMessageMediaStorageReady(): void {
  if (getMessageMediaStorageMode() === "s3") {
    getMediaStorage();
  }
}

/**
 * In `s3` mode, proves the bucket accepts a write, a read and a delete with
 * the configured keys. Throws a message naming the bucket, endpoint and S3
 * error code (never the keys). Returns a log line, or null in `local` mode.
 */
export async function verifyMessageMediaStorageAccess(
  verify: typeof verifyS3MediaStorageAccess = verifyS3MediaStorageAccess,
): Promise<string | null> {
  if (getMessageMediaStorageMode() !== "s3") {
    return null;
  }
  const config = readS3MediaConfig();
  await verify(config);
  return `message media: s3 bucket ${config.bucket} reachable at ${config.endpoint ?? "AWS S3"}`;
}

/** Resets the cached provider (tests). */
export function resetMediaStorageForTests(): void {
  provider = null;
  cachedMode = null;
}
