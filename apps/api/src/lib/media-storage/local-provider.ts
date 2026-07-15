import fs from "node:fs/promises";
import path from "node:path";

import type { MediaStorageProvider, SaveMessageMediaParams } from "./types.js";

const MIME_EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "video/webm": "webm",
  "video/mp4": "mp4",
};

export function extensionForMimeType(mimeType: string): string {
  return MIME_EXTENSIONS[mimeType] ?? "bin";
}

export function buildAttachmentKey(
  conversationId: string,
  messageId: string,
  mimeType: string,
): string {
  const ext = extensionForMimeType(mimeType);
  return `${conversationId}/${messageId}.${ext}`;
}

export function createLocalMediaStorageProvider(
  storageDir: string,
): MediaStorageProvider {
  return {
    async save(params: SaveMessageMediaParams): Promise<string> {
      const key = buildAttachmentKey(
        params.conversationId,
        params.messageId,
        params.mimeType,
      );
      const filePath = path.join(storageDir, key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, params.buffer);
      return key;
    },

    async delete(key: string): Promise<void> {
      const normalizedKey = key.replace(/^\/+/, "");
      const filePath = path.join(storageDir, normalizedKey);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },
  };
}
