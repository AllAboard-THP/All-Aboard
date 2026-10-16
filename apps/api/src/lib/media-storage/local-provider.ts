import fs from "node:fs/promises";
import path from "node:path";

import { buildMessageMediaPublicUrl } from "../message-media-url.js";
import { normalizeAttachmentKey } from "./paths.js";
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

function resolveStorageDir(storageDir: string | (() => string)): string {
  return typeof storageDir === "function" ? storageDir() : storageDir;
}

export function createLocalMediaStorageProvider(
  storageDir: string | (() => string),
): MediaStorageProvider {
  return {
    async save(params: SaveMessageMediaParams): Promise<string> {
      const key = normalizeAttachmentKey(
        buildAttachmentKey(
          params.conversationId,
          params.messageId,
          params.mimeType,
        ),
      );
      const filePath = path.join(resolveStorageDir(storageDir), key);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, params.buffer);
      return key;
    },

    async delete(key: string): Promise<void> {
      const filePath = path.join(
        resolveStorageDir(storageDir),
        normalizeAttachmentKey(key),
      );
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },

    async resolveUrl(attachmentKey: string): Promise<string> {
      return buildMessageMediaPublicUrl(normalizeAttachmentKey(attachmentKey));
    },
  };
}
