import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MESSAGE_AUDIO_MAX_BYTES,
  MESSAGE_AUDIO_MAX_DURATION_MS,
  MESSAGE_VIDEO_MAX_DURATION_MS,
  type MediaCaptureStream,
  type MediaCaptureTrack,
  type MediaRecorderLike,
} from "./media-recorder";
import { useMediaRecorder } from "./use-media-recorder";

type MockTrack = MediaCaptureTrack & { emitEnded: () => void; stop: ReturnType<typeof vi.fn> };

class MockRecorder implements MediaRecorderLike {
  state: RecordingState = "inactive";
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(
    readonly stream: MediaCaptureStream,
    readonly mimeType: string,
    private readonly chunk: Blob,
  ) {}

  start() {
    this.state = "recording";
  }

  stop() {
    if (this.state !== "recording") {
      return;
    }
    this.state = "inactive";
    this.ondataavailable?.({ data: this.chunk });
    this.onstop?.();
  }
}

function createTrack(): MockTrack {
  const listeners = new Set<() => void>();
  return {
    stop: vi.fn(),
    addEventListener: (_type: "ended", listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: "ended", listener: () => void) => {
      listeners.delete(listener);
    },
    emitEnded() {
      for (const listener of [...listeners]) {
        listener();
      }
    },
  };
}

function createStream(): { stream: MediaCaptureStream; tracks: MockTrack[] } {
  const tracks = [createTrack(), createTrack()];
  return { stream: { getTracks: () => tracks }, tracks };
}

function blobWithSize(size: number, type: string): Blob {
  const blob = new Blob(["x"], { type });
  Object.defineProperty(blob, "size", { value: size });
  return blob;
}

function setup(chunk = new Blob(["webm"], { type: "audio/webm" })) {
  const created: MockRecorder[] = [];
  const sessions = {
    microphone: createStream(),
    camera: createStream(),
    screen: createStream(),
  };
  const getUserMedia = vi.fn(async (constraints: MediaStreamConstraints) => {
    if (constraints.video) {
      return sessions.camera.stream;
    }
    return sessions.microphone.stream;
  });
  const getDisplayMedia = vi.fn(async () => sessions.screen.stream);
  const createObjectUrl = vi.fn(() => "blob:preview");
  const revokeObjectUrl = vi.fn();
  const isTypeSupported = vi.fn((mime: string) => mime.includes("webm"));

  const hook = renderHook(() =>
    useMediaRecorder({
      mediaDevices: { getUserMedia, getDisplayMedia },
      isTypeSupported,
      createRecorder: (stream, mimeType) => {
        const recorder = new MockRecorder(stream, mimeType, chunk);
        created.push(recorder);
        return recorder;
      },
      createObjectUrl,
      revokeObjectUrl,
      isSecureContext: true,
      tickMs: 1_000,
    }),
  );

  return {
    ...hook,
    created,
    sessions,
    getUserMedia,
    getDisplayMedia,
    createObjectUrl,
    revokeObjectUrl,
    isTypeSupported,
  };
}

describe("useMediaRecorder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records microphone audio and keeps a preview under the 5 minute cap", async () => {
    const harness = setup();

    await act(async () => {
      await harness.result.current.start("microphone");
    });

    expect(harness.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(harness.getDisplayMedia).not.toHaveBeenCalled();
    expect(harness.result.current.phase).toBe("recording");
    expect(harness.result.current.maxDurationMs).toBe(MESSAGE_AUDIO_MAX_DURATION_MS);
    expect(harness.created[0]?.mimeType).toBe("audio/webm;codecs=opus");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });
    expect(harness.result.current.remainingMs).toBe(
      MESSAGE_AUDIO_MAX_DURATION_MS - 4_000,
    );

    act(() => {
      harness.result.current.stop();
    });

    expect(harness.result.current.phase).toBe("preview");
    expect(harness.result.current.recording).toMatchObject({
      mimeType: "audio/webm",
      kind: "audio",
      source: "microphone",
      previewUrl: "blob:preview",
    });
    expect(harness.result.current.recording?.durationMs).toBeGreaterThanOrEqual(1);
    expect(harness.result.current.recording?.durationMs).toBeLessThanOrEqual(
      MESSAGE_AUDIO_MAX_DURATION_MS,
    );
    expect(harness.sessions.microphone.tracks[0]?.stop).toHaveBeenCalled();
  });

  it("stops audio automatically at 5 minutes", async () => {
    const harness = setup();

    await act(async () => {
      await harness.result.current.start("microphone");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(MESSAGE_AUDIO_MAX_DURATION_MS);
    });

    expect(harness.result.current.phase).toBe("preview");
    expect(harness.result.current.recording?.durationMs).toBe(
      MESSAGE_AUDIO_MAX_DURATION_MS,
    );
  });

  it("records camera video with a 3 minute cap", async () => {
    const harness = setup(new Blob(["video"], { type: "video/webm" }));

    await act(async () => {
      await harness.result.current.start("camera");
    });

    expect(harness.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: true,
    });
    expect(harness.result.current.maxDurationMs).toBe(MESSAGE_VIDEO_MAX_DURATION_MS);
    expect(harness.created[0]?.mimeType).toBe("video/webm;codecs=vp9,opus");
    expect(harness.result.current.liveStream).toBe(harness.sessions.camera.stream);
  });

  it("records a screen share and stops when the user ends it", async () => {
    const harness = setup(new Blob(["video"], { type: "video/webm" }));

    await act(async () => {
      await harness.result.current.start("screen");
    });

    expect(harness.getDisplayMedia).toHaveBeenCalledWith({
      video: true,
      audio: true,
    });
    expect(harness.getUserMedia).not.toHaveBeenCalled();

    act(() => {
      harness.sessions.screen.tracks[0]?.emitEnded();
    });

    expect(harness.result.current.phase).toBe("preview");
    expect(harness.result.current.recording).toMatchObject({
      kind: "video",
      source: "screen",
      mimeType: "video/webm",
    });
  });

  it("returns to idle when the screen picker is dismissed", async () => {
    const harness = setup();
    harness.getDisplayMedia.mockRejectedValueOnce(
      new DOMException("cancel", "AbortError"),
    );

    await act(async () => {
      await harness.result.current.start("screen");
    });

    expect(harness.result.current.phase).toBe("idle");
    expect(harness.result.current.error).toBeNull();
    expect(harness.created).toHaveLength(0);
  });

  it("reports a denied permission without starting the recorder", async () => {
    const harness = setup();
    harness.getUserMedia.mockRejectedValueOnce(
      new DOMException("denied", "NotAllowedError"),
    );

    await act(async () => {
      await harness.result.current.start("microphone");
    });

    expect(harness.result.current.phase).toBe("error");
    expect(harness.result.current.error).toBe("permission_denied");
    expect(harness.created).toHaveLength(0);
  });

  it("refuses to record outside a secure context", async () => {
    const getUserMedia = vi.fn();
    const { result } = renderHook(() =>
      useMediaRecorder({
        mediaDevices: { getUserMedia },
        isSecureContext: false,
        isTypeSupported: () => true,
      }),
    );

    await act(async () => {
      await result.current.start("microphone");
    });

    expect(result.current.error).toBe("insecure_context");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("reports an unsupported browser when no MIME type is available", async () => {
    const harness = setup();
    harness.isTypeSupported.mockReturnValue(false);

    await act(async () => {
      await harness.result.current.start("camera");
    });

    expect(harness.result.current.error).toBe("not_supported");
    expect(harness.getUserMedia).not.toHaveBeenCalled();
  });

  it("disables screen capture when getDisplayMedia is missing", async () => {
    const getUserMedia = vi.fn();
    const { result } = renderHook(() =>
      useMediaRecorder({
        mediaDevices: { getUserMedia },
        isSecureContext: true,
        isTypeSupported: () => true,
      }),
    );

    expect(result.current.screenCaptureSupported).toBe(false);

    await act(async () => {
      await result.current.start("screen");
    });

    expect(result.current.error).toBe("not_supported");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("rejects an audio recording over 10 MB", async () => {
    const harness = setup(
      blobWithSize(MESSAGE_AUDIO_MAX_BYTES + 1, "audio/webm"),
    );

    await act(async () => {
      await harness.result.current.start("microphone");
    });
    act(() => {
      harness.result.current.stop();
    });

    expect(harness.result.current.phase).toBe("error");
    expect(harness.result.current.error).toBe("file_too_large");
    expect(harness.result.current.recording).toBeNull();
    expect(harness.createObjectUrl).not.toHaveBeenCalled();
  });

  it("reports an empty recording", async () => {
    const harness = setup(new Blob([], { type: "audio/webm" }));

    await act(async () => {
      await harness.result.current.start("microphone");
    });
    act(() => {
      harness.result.current.stop();
    });

    expect(harness.result.current.error).toBe("no_data");
  });

  it("discards a preview and revokes its object URL", async () => {
    const harness = setup();

    await act(async () => {
      await harness.result.current.start("microphone");
    });
    act(() => {
      harness.result.current.stop();
    });
    act(() => {
      harness.result.current.discard();
    });

    expect(harness.revokeObjectUrl).toHaveBeenCalledWith("blob:preview");
    expect(harness.result.current.phase).toBe("idle");
    expect(harness.result.current.recording).toBeNull();
  });

  it("drops a stream that arrives after the user cancels", async () => {
    let resolveStream: ((stream: MediaCaptureStream) => void) | undefined;
    const track = createTrack();
    const getUserMedia = vi.fn(
      () =>
        new Promise<MediaCaptureStream>((resolve) => {
          resolveStream = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useMediaRecorder({
        mediaDevices: { getUserMedia },
        isSecureContext: true,
        isTypeSupported: () => true,
        createRecorder: () => {
          throw new Error("should not record");
        },
        tickMs: 1_000,
      }),
    );

    await act(async () => {
      void result.current.start("microphone");
      await Promise.resolve();
    });
    act(() => {
      result.current.discard();
    });
    await act(async () => {
      resolveStream?.({ getTracks: () => [track] });
      await Promise.resolve();
    });

    expect(track.stop).toHaveBeenCalled();
    expect(result.current.phase).toBe("idle");
  });

  it("stops tracks when the hook unmounts mid-recording", async () => {
    const harness = setup();

    await act(async () => {
      await harness.result.current.start("microphone");
    });
    harness.unmount();

    expect(harness.sessions.microphone.tracks[0]?.stop).toHaveBeenCalled();
  });
});
