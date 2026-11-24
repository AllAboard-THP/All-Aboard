/**
 * Client-side limits and MIME selection for async chat recordings.
 * Duration and size quotas mirror `apps/api/src/services/message-media-upload-rules.ts`.
 * Screen capture is often missing on mobile Safari — hide or disable that control
 * when `isScreenCaptureSupported` is false.
 */

export const MESSAGE_AUDIO_MAX_DURATION_MS = 300_000;
export const MESSAGE_VIDEO_MAX_DURATION_MS = 180_000;
export const MESSAGE_AUDIO_MAX_BYTES = 10 * 1024 * 1024;
export const MESSAGE_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
/** Narrated screen recordings (#197) get more room than camera videos. */
export const MESSAGE_SCREEN_MAX_DURATION_MS = 300_000;
export const MESSAGE_SCREEN_MAX_BYTES = 100 * 1024 * 1024;

export const AUDIO_RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
] as const;

export const VIDEO_RECORDER_MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
] as const;

export type MediaRecorderMode = "microphone" | "camera" | "screen";

export type RecordedMediaKind = "audio" | "video";

export type MediaRecorderPhase = "idle" | "recording" | "preview" | "error";

export type MediaRecorderErrorCode =
  | "permission_denied"
  | "insecure_context"
  | "not_supported"
  | "capture_aborted"
  | "no_data"
  | "file_too_large";

/** Audio sources of a screen recording, picked before the share starts. */
export type ScreenAudioOptions = {
  microphone: boolean;
  screenAudio: boolean;
};

export const DEFAULT_SCREEN_AUDIO: ScreenAudioOptions = {
  microphone: true,
  screenAudio: true,
};

/** Shown while recording when the screen recording lacks a wanted sound source. */
export type RecorderAudioWarning =
  | "microphone_unavailable"
  | "screen_audio_unavailable"
  | "silent";

export type RecordedMedia = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  source: MediaRecorderMode;
  kind: RecordedMediaKind;
  previewUrl: string;
};

export type MediaCaptureTrack = {
  kind?: string;
  stop: () => void;
  addEventListener: (type: "ended", listener: () => void) => void;
  removeEventListener: (type: "ended", listener: () => void) => void;
};

export type MediaCaptureStream = {
  getTracks: () => MediaCaptureTrack[];
};

export type MediaCaptureDevices = {
  getUserMedia: (
    constraints: MediaStreamConstraints,
  ) => Promise<MediaCaptureStream>;
  getDisplayMedia?: (
    constraints: DisplayMediaStreamOptions,
  ) => Promise<MediaCaptureStream>;
};

export type MediaRecorderLike = {
  state: RecordingState;
  start: (timeslice?: number) => void;
  stop: () => void;
  ondataavailable: ((event: { data: Blob }) => void) | null;
  onstop: (() => void) | null;
  onerror: ((event: Event) => void) | null;
};

export function kindForRecorderMode(mode: MediaRecorderMode): RecordedMediaKind {
  return mode === "microphone" ? "audio" : "video";
}

export function maxDurationMsForRecorderMode(mode: MediaRecorderMode): number {
  if (mode === "microphone") return MESSAGE_AUDIO_MAX_DURATION_MS;
  return mode === "screen"
    ? MESSAGE_SCREEN_MAX_DURATION_MS
    : MESSAGE_VIDEO_MAX_DURATION_MS;
}

export function maxBytesForRecorderMode(mode: MediaRecorderMode): number {
  if (mode === "microphone") return MESSAGE_AUDIO_MAX_BYTES;
  return mode === "screen" ? MESSAGE_SCREEN_MAX_BYTES : MESSAGE_VIDEO_MAX_BYTES;
}

export function mimeCandidatesForMode(mode: MediaRecorderMode): readonly string[] {
  return mode === "microphone"
    ? AUDIO_RECORDER_MIME_CANDIDATES
    : VIDEO_RECORDER_MIME_CANDIDATES;
}

/** First supported candidate. Video prefers `video/webm;codecs=vp9,opus`. */
export function selectRecorderMimeType(
  mode: MediaRecorderMode,
  isTypeSupported: (mimeType: string) => boolean,
): string | null {
  for (const candidate of mimeCandidatesForMode(mode)) {
    if (isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return null;
}

/** Strip codec parameters so the upload MIME matches the API allow-list. */
export function baseMimeType(mimeType: string): string {
  const base = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  return base;
}

export function clampRecordedDurationMs(
  elapsedMs: number,
  maxDurationMs: number,
): number {
  const rounded = Math.round(elapsedMs);
  if (!Number.isFinite(rounded) || rounded <= 0) {
    return 1;
  }
  return Math.min(maxDurationMs, rounded);
}

/** `m:ss` countdown. Rounds up so the clock does not hit 0:00 early. */
export function formatRecorderClock(durationMs: number): string {
  const safe = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
  const totalSeconds = Math.ceil(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function isScreenCaptureSupported(
  mediaDevices: { getDisplayMedia?: unknown } | null | undefined,
): boolean {
  return typeof mediaDevices?.getDisplayMedia === "function";
}

export function bindStreamEnded(
  stream: MediaCaptureStream,
  onEnded: () => void,
): () => void {
  const bindings = stream.getTracks().map((track) => {
    const listener = () => {
      onEnded();
    };
    track.addEventListener("ended", listener);
    return { track, listener };
  });

  return () => {
    for (const { track, listener } of bindings) {
      track.removeEventListener("ended", listener);
    }
  };
}

export function mapCaptureError(error: unknown): MediaRecorderErrorCode {
  const name = readErrorName(error);
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "permission_denied";
  }
  if (name === "AbortError") {
    return "capture_aborted";
  }
  if (name === "SecurityError") {
    return "insecure_context";
  }
  return "not_supported";
}

function readErrorName(error: unknown): string {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name;
  }
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    typeof error.name === "string"
  ) {
    return error.name;
  }
  return "";
}

/** Builds streams and mixes audio. The browser default uses MediaStream and Web Audio. */
export type CaptureStreamFactory = {
  createStream: (tracks: MediaCaptureTrack[]) => MediaCaptureStream;
  mixAudio: (tracks: MediaCaptureTrack[]) => {
    track: MediaCaptureTrack;
    dispose: () => void;
  };
};

export type ComposedScreenRecording = {
  stream: MediaCaptureStream;
  warning: RecorderAudioWarning | null;
  /** Stops every source track and closes the mixer. Safe to call twice. */
  dispose: () => void;
};

function tracksOfKind(
  stream: MediaCaptureStream | null,
  kind: "audio" | "video",
): MediaCaptureTrack[] {
  return stream ? stream.getTracks().filter((track) => track.kind === kind) : [];
}

/**
 * MediaRecorder records one audio track, so the microphone and the screen
 * sound are mixed into one. A source the user switched off is stopped.
 */
export function composeScreenRecording(
  display: MediaCaptureStream,
  microphone: MediaCaptureStream | null,
  wanted: ScreenAudioOptions,
  factory: CaptureStreamFactory,
): ComposedScreenRecording {
  const video = tracksOfKind(display, "video");
  const displayAudio = tracksOfKind(display, "audio");
  const screenAudio = wanted.screenAudio ? displayAudio : [];
  if (!wanted.screenAudio) {
    for (const track of displayAudio) track.stop();
  }
  const micAudio = wanted.microphone ? tracksOfKind(microphone, "audio") : [];
  const audio = [...micAudio, ...screenAudio];

  let warning: RecorderAudioWarning | null = null;
  if (audio.length === 0) {
    warning = "silent";
  } else if (wanted.microphone && micAudio.length === 0) {
    warning = "microphone_unavailable";
  } else if (wanted.screenAudio && screenAudio.length === 0) {
    warning = "screen_audio_unavailable";
  }

  const mixer = audio.length > 1 ? factory.mixAudio(audio) : null;
  const recordedAudio = mixer ? [mixer.track] : audio;
  const stream = factory.createStream([...video, ...recordedAudio]);

  let disposed = false;
  return {
    stream,
    warning,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const track of display.getTracks()) track.stop();
      for (const track of microphone?.getTracks() ?? []) track.stop();
      mixer?.dispose();
    },
  };
}

export const browserCaptureStreamFactory: CaptureStreamFactory = {
  createStream: (tracks) => new MediaStream(tracks as MediaStreamTrack[]),
  mixAudio: (tracks) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();
    for (const track of tracks) {
      context
        .createMediaStreamSource(new MediaStream([track as MediaStreamTrack]))
        .connect(destination);
    }
    const [mixed] = destination.stream.getAudioTracks();
    return {
      track: mixed as MediaCaptureTrack,
      dispose: () => {
        mixed?.stop();
        void context.close().catch(() => undefined);
      },
    };
  },
};
