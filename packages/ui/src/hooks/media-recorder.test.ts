import { describe, expect, it } from "vitest";

import {
  AUDIO_RECORDER_MIME_CANDIDATES,
  MESSAGE_AUDIO_MAX_BYTES,
  MESSAGE_AUDIO_MAX_DURATION_MS,
  MESSAGE_VIDEO_MAX_BYTES,
  MESSAGE_VIDEO_MAX_DURATION_MS,
  VIDEO_RECORDER_MIME_CANDIDATES,
  baseMimeType,
  bindStreamEnded,
  clampRecordedDurationMs,
  formatRecorderClock,
  isScreenCaptureSupported,
  kindForRecorderMode,
  mapCaptureError,
  maxBytesForRecorderKind,
  maxDurationMsForRecorderMode,
  selectRecorderMimeType,
} from "./media-recorder";

describe("media recorder limits", () => {
  it("caps audio at 5 minutes and video at 3 minutes", () => {
    expect(MESSAGE_AUDIO_MAX_DURATION_MS).toBe(300_000);
    expect(MESSAGE_VIDEO_MAX_DURATION_MS).toBe(180_000);
    expect(maxDurationMsForRecorderMode("microphone")).toBe(300_000);
    expect(maxDurationMsForRecorderMode("camera")).toBe(180_000);
    expect(maxDurationMsForRecorderMode("screen")).toBe(180_000);
  });

  it("caps audio at 10 MB and video at 50 MB", () => {
    expect(MESSAGE_AUDIO_MAX_BYTES).toBe(10 * 1024 * 1024);
    expect(MESSAGE_VIDEO_MAX_BYTES).toBe(50 * 1024 * 1024);
    expect(maxBytesForRecorderKind("audio")).toBe(MESSAGE_AUDIO_MAX_BYTES);
    expect(maxBytesForRecorderKind("video")).toBe(MESSAGE_VIDEO_MAX_BYTES);
  });

  it("maps microphone to audio and camera or screen to video", () => {
    expect(kindForRecorderMode("microphone")).toBe("audio");
    expect(kindForRecorderMode("camera")).toBe("video");
    expect(kindForRecorderMode("screen")).toBe("video");
  });
});

describe("selectRecorderMimeType", () => {
  it("prefers vp9 opus for video and opus webm for audio", () => {
    expect(VIDEO_RECORDER_MIME_CANDIDATES[0]).toBe("video/webm;codecs=vp9,opus");
    expect(AUDIO_RECORDER_MIME_CANDIDATES[0]).toBe("audio/webm;codecs=opus");
    expect(selectRecorderMimeType("camera", () => true)).toBe(
      "video/webm;codecs=vp9,opus",
    );
    expect(selectRecorderMimeType("microphone", () => true)).toBe(
      "audio/webm;codecs=opus",
    );
  });

  it("falls back when the preferred codec is missing", () => {
    expect(
      selectRecorderMimeType(
        "screen",
        (mime) => mime === "video/mp4",
      ),
    ).toBe("video/mp4");
    expect(
      selectRecorderMimeType(
        "microphone",
        (mime) => mime === "audio/ogg",
      ),
    ).toBe("audio/ogg");
  });

  it("returns null when the browser supports none of the candidates", () => {
    expect(selectRecorderMimeType("camera", () => false)).toBeNull();
  });
});

describe("recorder helpers", () => {
  it("strips codec parameters from the MIME type", () => {
    expect(baseMimeType("audio/webm;codecs=opus")).toBe("audio/webm");
    expect(baseMimeType("video/webm;codecs=vp9,opus")).toBe("video/webm");
  });

  it("clamps duration into the server range", () => {
    expect(clampRecordedDurationMs(0, 300_000)).toBe(1);
    expect(clampRecordedDurationMs(12_400.4, 300_000)).toBe(12_400);
    expect(clampRecordedDurationMs(400_000, 300_000)).toBe(300_000);
  });

  it("formats a countdown clock", () => {
    expect(formatRecorderClock(300_000)).toBe("5:00");
    expect(formatRecorderClock(180_000)).toBe("3:00");
    expect(formatRecorderClock(4_100)).toBe("0:05");
    expect(formatRecorderClock(0)).toBe("0:00");
  });

  it("detects screen capture only when getDisplayMedia exists", () => {
    expect(isScreenCaptureSupported(null)).toBe(false);
    expect(isScreenCaptureSupported({})).toBe(false);
    expect(
      isScreenCaptureSupported({ getDisplayMedia: () => Promise.resolve() }),
    ).toBe(true);
  });

  it("maps permission, abort, and insecure capture failures", () => {
    expect(mapCaptureError(new DOMException("no", "NotAllowedError"))).toBe(
      "permission_denied",
    );
    expect(mapCaptureError({ name: "PermissionDeniedError" })).toBe(
      "permission_denied",
    );
    expect(mapCaptureError(new DOMException("cancel", "AbortError"))).toBe(
      "capture_aborted",
    );
    expect(mapCaptureError(new DOMException("http", "SecurityError"))).toBe(
      "insecure_context",
    );
    expect(mapCaptureError(new DOMException("missing", "NotFoundError"))).toBe(
      "not_supported",
    );
    expect(mapCaptureError(new Error("boom"))).toBe("not_supported");
  });

  it("unbinds the ended listener", () => {
    let ended: (() => void) | null = null;
    const track = {
      stop: () => {},
      addEventListener: (_type: "ended", listener: () => void) => {
        ended = listener;
      },
      removeEventListener: (_type: "ended", listener: () => void) => {
        if (ended === listener) {
          ended = null;
        }
      },
    };
    const onEnded = () => {};
    const unbind = bindStreamEnded({ getTracks: () => [track] }, onEnded);
    expect(ended).toBeTypeOf("function");
    unbind();
    expect(ended).toBeNull();
  });
});
