"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  baseMimeType,
  bindStreamEnded,
  clampRecordedDurationMs,
  isScreenCaptureSupported,
  kindForRecorderMode,
  mapCaptureError,
  maxBytesForRecorderKind,
  maxDurationMsForRecorderMode,
  selectRecorderMimeType,
  type MediaCaptureDevices,
  type MediaCaptureStream,
  type MediaRecorderErrorCode,
  type MediaRecorderLike,
  type MediaRecorderMode,
  type MediaRecorderPhase,
  type RecordedMedia,
} from "./media-recorder";

const DEFAULT_TICK_MS = 250;

type StopIntent = "save" | "discard" | "fail";

export type UseMediaRecorderOptions = {
  mediaDevices?: MediaCaptureDevices | null;
  isTypeSupported?: (mimeType: string) => boolean;
  createRecorder?: (
    stream: MediaCaptureStream,
    mimeType: string,
  ) => MediaRecorderLike;
  createObjectUrl?: (blob: Blob) => string;
  revokeObjectUrl?: (url: string) => void;
  isSecureContext?: boolean;
  /** How often the countdown updates. Defaults to 250ms. */
  tickMs?: number;
};

export type UseMediaRecorderResult = {
  phase: MediaRecorderPhase;
  mode: MediaRecorderMode | null;
  elapsedMs: number;
  remainingMs: number;
  maxDurationMs: number;
  error: MediaRecorderErrorCode | null;
  recording: RecordedMedia | null;
  liveStream: MediaCaptureStream | null;
  screenCaptureSupported: boolean;
  start: (mode: MediaRecorderMode) => Promise<void>;
  stop: () => void;
  discard: () => void;
};

function readDefaultDevices(): MediaCaptureDevices | null {
  if (typeof navigator === "undefined" || navigator.mediaDevices == null) {
    return null;
  }
  return navigator.mediaDevices;
}

function readDefaultSecureContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

function defaultIsTypeSupported(mimeType: string): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported(mimeType)
  );
}

function defaultCreateRecorder(
  stream: MediaCaptureStream,
  mimeType: string,
): MediaRecorderLike {
  return new MediaRecorder(stream as MediaStream, {
    mimeType,
  }) as MediaRecorderLike;
}

function defaultCreateObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

function defaultRevokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

function stopStream(stream: MediaCaptureStream | null): void {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

function constraintsForMode(mode: MediaRecorderMode): MediaStreamConstraints {
  if (mode === "microphone") {
    return { audio: true };
  }
  return { video: true, audio: true };
}

export function useMediaRecorder(
  options: UseMediaRecorderOptions = {},
): UseMediaRecorderResult {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [phase, setPhase] = useState<MediaRecorderPhase>("idle");
  const [mode, setMode] = useState<MediaRecorderMode | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<MediaRecorderErrorCode | null>(null);
  const [recording, setRecording] = useState<RecordedMedia | null>(null);
  const [liveStream, setLiveStream] = useState<MediaCaptureStream | null>(null);

  const recorderRef = useRef<MediaRecorderLike | null>(null);
  const streamRef = useRef<MediaCaptureStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef("");
  const modeRef = useRef<MediaRecorderMode | null>(null);
  const startedAtRef = useRef(0);
  const stopIntentRef = useRef<StopIntent>("save");
  const stoppedRef = useRef(false);
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const previewUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detachEndedRef = useRef<(() => void) | null>(null);

  const devices =
    options.mediaDevices === undefined
      ? readDefaultDevices()
      : options.mediaDevices;
  const screenCaptureSupported = isScreenCaptureSupported(devices);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const revokePreview = useCallback(() => {
    if (!previewUrlRef.current) {
      return;
    }
    const revoke = optionsRef.current.revokeObjectUrl ?? defaultRevokeObjectUrl;
    revoke(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  const detachEnded = useCallback(() => {
    detachEndedRef.current?.();
    detachEndedRef.current = null;
  }, []);

  const releaseStream = useCallback(() => {
    detachEnded();
    stopStream(streamRef.current);
    streamRef.current = null;
    if (mountedRef.current) {
      setLiveStream(null);
    }
  }, [detachEnded]);

  const finalize = useCallback(() => {
    clearTimer();
    const intent = stopIntentRef.current;
    const activeMode = modeRef.current;
    const chunks = chunksRef.current;
    chunksRef.current = [];
    const mime = baseMimeType(mimeRef.current);
    releaseStream();
    recorderRef.current = null;

    if (!mountedRef.current) {
      return;
    }

    if (intent === "discard") {
      setPhase("idle");
      setError(null);
      setRecording(null);
      setElapsedMs(0);
      setMode(null);
      modeRef.current = null;
      return;
    }

    if (intent === "fail") {
      setRecording(null);
      setElapsedMs(0);
      return;
    }

    if (!activeMode || chunks.length === 0) {
      setPhase("error");
      setError("no_data");
      setRecording(null);
      return;
    }

    const kind = kindForRecorderMode(activeMode);
    const sizeBytes = chunks.reduce((total, chunk) => total + chunk.size, 0);
    if (sizeBytes > maxBytesForRecorderKind(kind)) {
      setPhase("error");
      setError("file_too_large");
      setRecording(null);
      return;
    }

    const blob = new Blob(chunks, { type: mime });

    const durationMs = clampRecordedDurationMs(
      Date.now() - startedAtRef.current,
      maxDurationMsForRecorderMode(activeMode),
    );
    const createUrl = optionsRef.current.createObjectUrl ?? defaultCreateObjectUrl;
    const previewUrl = createUrl(blob);
    previewUrlRef.current = previewUrl;
    setRecording({
      blob,
      mimeType: mime,
      durationMs,
      source: activeMode,
      kind,
      previewUrl,
    });
    setElapsedMs(durationMs);
    setError(null);
    setPhase("preview");
  }, [clearTimer, releaseStream]);

  const stop = useCallback(() => {
    if (stoppedRef.current) {
      return;
    }
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") {
      return;
    }
    stoppedRef.current = true;
    clearTimer();
    recorder.stop();
  }, [clearTimer]);

  const startTimer = useCallback(
    (activeMode: MediaRecorderMode) => {
      const tickMs = optionsRef.current.tickMs ?? DEFAULT_TICK_MS;
      const maxDuration = maxDurationMsForRecorderMode(activeMode);
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        if (elapsed >= maxDuration) {
          setElapsedMs(maxDuration);
          stop();
          return;
        }
        setElapsedMs(elapsed);
      }, tickMs);
    },
    [stop],
  );

  const discard = useCallback(() => {
    generationRef.current += 1;
    if (recorderRef.current?.state === "recording") {
      stopIntentRef.current = "discard";
      stop();
      return;
    }
    clearTimer();
    releaseStream();
    recorderRef.current = null;
    revokePreview();
    setRecording(null);
    setError(null);
    setElapsedMs(0);
    setPhase("idle");
    setMode(null);
    modeRef.current = null;
  }, [clearTimer, releaseStream, revokePreview, stop]);

  const start = useCallback(
    async (nextMode: MediaRecorderMode) => {
      if (recorderRef.current?.state === "recording") {
        return;
      }

      const generation = generationRef.current + 1;
      generationRef.current = generation;
      revokePreview();
      setRecording(null);
      setError(null);
      setElapsedMs(0);
      setMode(nextMode);
      modeRef.current = nextMode;
      stopIntentRef.current = "save";

      const secure =
        optionsRef.current.isSecureContext ?? readDefaultSecureContext();
      if (!secure) {
        setPhase("error");
        setError("insecure_context");
        return;
      }

      const mediaDevices =
        optionsRef.current.mediaDevices === undefined
          ? readDefaultDevices()
          : optionsRef.current.mediaDevices;
      if (!mediaDevices?.getUserMedia) {
        setPhase("error");
        setError("not_supported");
        return;
      }
      if (
        nextMode === "screen" &&
        typeof mediaDevices.getDisplayMedia !== "function"
      ) {
        setPhase("error");
        setError("not_supported");
        return;
      }

      const isTypeSupported =
        optionsRef.current.isTypeSupported ?? defaultIsTypeSupported;
      const mimeType = selectRecorderMimeType(nextMode, isTypeSupported);
      if (!mimeType) {
        setPhase("error");
        setError("not_supported");
        return;
      }

      let stream: MediaCaptureStream;
      try {
        stream =
          nextMode === "screen"
            ? await mediaDevices.getDisplayMedia!({ video: true, audio: true })
            : await mediaDevices.getUserMedia(constraintsForMode(nextMode));
      } catch (captureError) {
        if (!mountedRef.current || generation !== generationRef.current) {
          return;
        }
        const code = mapCaptureError(captureError);
        if (code === "capture_aborted") {
          setPhase("idle");
          setError(null);
          setMode(null);
          modeRef.current = null;
          return;
        }
        setPhase("error");
        setError(code);
        return;
      }

      if (!mountedRef.current || generation !== generationRef.current) {
        stopStream(stream);
        return;
      }

      const createRecorder =
        optionsRef.current.createRecorder ?? defaultCreateRecorder;
      let recorder: MediaRecorderLike;
      try {
        recorder = createRecorder(stream, mimeType);
      } catch {
        stopStream(stream);
        if (mountedRef.current) {
          setPhase("error");
          setError("not_supported");
        }
        return;
      }

      chunksRef.current = [];
      mimeRef.current = mimeType;
      stoppedRef.current = false;
      stopIntentRef.current = "save";
      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        finalize();
      };
      recorder.onerror = () => {
        stopIntentRef.current = "fail";
        if (mountedRef.current) {
          setPhase("error");
          setError("not_supported");
        }
        if (recorder.state === "recording") {
          stop();
          return;
        }
        releaseStream();
      };

      detachEndedRef.current = bindStreamEnded(stream, () => {
        stop();
      });

      try {
        recorder.start(optionsRef.current.tickMs ?? DEFAULT_TICK_MS);
      } catch {
        detachEnded();
        recorderRef.current = null;
        stopStream(stream);
        streamRef.current = null;
        if (mountedRef.current) {
          setPhase("error");
          setError("not_supported");
        }
        return;
      }

      if (!mountedRef.current || generation !== generationRef.current) {
        stoppedRef.current = true;
        stopIntentRef.current = "discard";
        try {
          recorder.stop();
        } catch {
          stopStream(stream);
        }
        return;
      }

      setLiveStream(stream);
      setPhase("recording");
      startTimer(nextMode);
    },
    [detachEnded, finalize, releaseStream, revokePreview, startTimer, stop],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      clearTimer();
      detachEnded();
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder && recorder.state === "recording") {
        stopIntentRef.current = "discard";
        try {
          recorder.stop();
        } catch {
          stopStream(streamRef.current);
        }
      } else {
        stopStream(streamRef.current);
      }
      streamRef.current = null;
      if (previewUrlRef.current) {
        const revoke =
          optionsRef.current.revokeObjectUrl ?? defaultRevokeObjectUrl;
        revoke(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, [clearTimer, detachEnded]);

  const maxDurationMs = mode ? maxDurationMsForRecorderMode(mode) : 0;
  const remainingMs =
    phase === "recording" ? Math.max(0, maxDurationMs - elapsedMs) : 0;

  return {
    phase,
    mode,
    elapsedMs,
    remainingMs,
    maxDurationMs,
    error,
    recording,
    liveStream,
    screenCaptureSupported,
    start,
    stop,
    discard,
  };
}
