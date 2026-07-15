import fs from "node:fs/promises";
import path from "node:path";

import {
  buildAttachmentKey,
} from "./local-provider.js";
import { messageMediaFilePath } from "./paths.js";
import type { MediaStorageProvider } from "./types.js";

export { buildAttachmentKey, extensionForMimeType } from "./local-provider.js";
export {
  ensureMessageMediaStorageDir,
  getMessageMediaStorageDir,
  messageMediaFilePath,
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

export function getMediaStorage(): MediaStorageProvider {
  if (!provider) {
    provider = {
      save: async (params) =>
        localMediaStorageProvider.save(
          params.conversationId,
          params.messageId,
          params.buffer,
          params.mimeType,
        ),
      delete: (key) => localMediaStorageProvider.delete(key),
    };
  }
  return provider;
}

/** Resets the cached provider (tests). */
export function resetMediaStorageForTests(): void {
  provider = null;
}
