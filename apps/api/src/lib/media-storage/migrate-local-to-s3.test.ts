import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  guessMessageMediaMimeType,
  migrateLocalMessageMediaToS3,
} from "./migrate-local-to-s3.js";

describe("migrateLocalMessageMediaToS3", () => {
  let tempDir: string | undefined;

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
      tempDir = undefined;
    }
  });

  it("prefers the database MIME type over the file extension", () => {
    const mimeByKey = new Map([["conv/voice.webm", "audio/webm"]]);
    expect(guessMessageMediaMimeType("conv/voice.webm", mimeByKey)).toBe(
      "audio/webm",
    );
    expect(guessMessageMediaMimeType("conv/clip.webm")).toBe("video/webm");
  });

  it("uploads each local file once and records failures", async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "msg-migrate-"));
    await fs.mkdir(path.join(tempDir, "conv-1"), { recursive: true });
    await fs.writeFile(path.join(tempDir, "conv-1", "msg-1.webm"), "audio");
    await fs.writeFile(path.join(tempDir, "conv-1", "msg-2.mp4"), "video");

    const uploaded: string[] = [];
    const result = await migrateLocalMessageMediaToS3({
      storageDir: tempDir,
      mimeByKey: new Map([["conv-1/msg-1.webm", "audio/webm"]]),
      upload: async (attachmentKey, _body, mimeType) => {
        uploaded.push(`${attachmentKey}:${mimeType}`);
        if (attachmentKey.endsWith(".mp4")) {
          throw new Error("boom");
        }
        return "uploaded";
      },
    });

    expect(uploaded.sort()).toEqual([
      "conv-1/msg-1.webm:audio/webm",
      "conv-1/msg-2.mp4:video/mp4",
    ]);
    expect(result).toEqual({
      uploaded: 1,
      skipped: 0,
      failed: [{ key: "conv-1/msg-2.mp4", error: "boom" }],
    });
  });

  it("returns an empty result when the local directory is missing", async () => {
    const result = await migrateLocalMessageMediaToS3({
      storageDir: path.join(os.tmpdir(), "missing-message-media-dir"),
      upload: async () => "uploaded",
    });
    expect(result).toEqual({ uploaded: 0, skipped: 0, failed: [] });
  });
});