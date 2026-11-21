import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { localMediaStorageProvider } from "./index.js";
import { getMessageMediaStorageDir } from "./paths.js";

describe("localMediaStorageProvider", () => {
  let tempDir: string | undefined;

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
    delete process.env.MESSAGE_MEDIA_STORAGE_DIR;
  });

  it("writes files under the configured storage directory", async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "msg-media-"));
    process.env.MESSAGE_MEDIA_STORAGE_DIR = tempDir;

    const buffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
    const key = await localMediaStorageProvider.save(
      "conv-1",
      "msg-1",
      buffer,
      "audio/webm",
    );

    expect(key).toBe("conv-1/msg-1.webm");
    const stored = await fs.readFile(
      path.join(getMessageMediaStorageDir(), key),
    );
    expect(stored.equals(buffer)).toBe(true);
  });

  it("deletes stored files by attachment key", async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "msg-media-"));
    process.env.MESSAGE_MEDIA_STORAGE_DIR = tempDir;

    const key = await localMediaStorageProvider.save(
      "conv-2",
      "msg-2",
      Buffer.from("audio"),
      "audio/ogg",
    );
    await localMediaStorageProvider.delete(key);
    await expect(
      fs.readFile(path.join(getMessageMediaStorageDir(), key)),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
