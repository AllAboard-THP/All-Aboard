import { describe, expect, it } from "vitest";

import {
  MESSAGE_AUDIO_MAX_BYTES,
  MESSAGE_VIDEO_MAX_DURATION_MS,
  bufferMatchesMimeType,
  validateMessageMediaDuration,
  validateMessageMediaMimeType,
  validateMessageMediaSize,
  validateMessageMediaSource,
} from "./message-media-upload-rules.js";

const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00]);
const oggHeader = Buffer.from("OggS\x00", "ascii");
const mp4Header = Buffer.concat([
  Buffer.alloc(4),
  Buffer.from("ftypisom", "ascii"),
]);

describe("message-media-upload-rules", () => {
  it("accepts allowed audio and video mime types", () => {
    expect(validateMessageMediaMimeType("audio", "audio/webm")).toBeNull();
    expect(validateMessageMediaMimeType("video", "video/mp4")).toBeNull();
  });

  it("rejects mime types outside the allowed set", () => {
    expect(validateMessageMediaMimeType("audio", "video/webm")).toBe(
      "invalid_file_type",
    );
    expect(validateMessageMediaMimeType("video", "audio/ogg")).toBe(
      "invalid_file_type",
    );
  });

  it("validates attachment source per kind", () => {
    expect(validateMessageMediaSource("audio", "microphone")).toBeNull();
    expect(validateMessageMediaSource("audio", "camera")).toBe(
      "invalid_media_source",
    );
    expect(validateMessageMediaSource("video", "screen")).toBeNull();
  });

  it("enforces size and duration limits", () => {
    expect(validateMessageMediaSize("audio", MESSAGE_AUDIO_MAX_BYTES)).toBeNull();
    expect(validateMessageMediaSize("audio", MESSAGE_AUDIO_MAX_BYTES + 1)).toBe(
      "file_too_large",
    );
    expect(
      validateMessageMediaDuration("video", MESSAGE_VIDEO_MAX_DURATION_MS),
    ).toBeNull();
    expect(
      validateMessageMediaDuration(
        "video",
        MESSAGE_VIDEO_MAX_DURATION_MS + 1,
      ),
    ).toBe("duration_exceeded");
  });

  it("sniffs magic bytes for supported containers", () => {
    expect(bufferMatchesMimeType(webmHeader, "audio/webm")).toBe(true);
    expect(bufferMatchesMimeType(webmHeader, "video/webm")).toBe(true);
    expect(bufferMatchesMimeType(oggHeader, "audio/ogg")).toBe(true);
    expect(bufferMatchesMimeType(mp4Header, "video/mp4")).toBe(true);
    expect(bufferMatchesMimeType(Buffer.from("not-media"), "audio/webm")).toBe(
      false,
    );
  });
});
