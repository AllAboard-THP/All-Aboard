"use client";

import { Mic, Monitor, Square, Video } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "../components/button";
import {
  MESSAGE_AUDIO_MAX_DURATION_MS,
  MESSAGE_VIDEO_MAX_DURATION_MS,
  formatRecorderClock,
  type MediaCaptureStream,
  type MediaRecorderErrorCode,
  type MediaRecorderMode,
  type MediaRecorderPhase,
  type RecordedMedia,
} from "../hooks/media-recorder";
import { useMediaRecorder } from "../hooks/use-media-recorder";
import { cn } from "../lib/utils";

export type MediaRecorderPanelLabels = {
  microphone: string;
  camera: string;
  screen: string;
  stop: string;
  discard: string;
  accept: string;
  livePreview: string;
  previewAudio: string;
  previewVideo: string;
  remaining: string;
  permissionDenied: string;
  insecureContext: string;
  notSupported: string;
  fileTooLarge: string;
  noData: string;
  screenUnsupported: string;
};

export const mediaRecorderPanelLabelsFr: MediaRecorderPanelLabels = {
  microphone: "Micro",
  camera: "Caméra",
  screen: "Écran",
  stop: "Arrêter",
  discard: "Annuler",
  accept: "Utiliser cet enregistrement",
  livePreview: "Aperçu en direct",
  previewAudio: "Aperçu du message vocal",
  previewVideo: "Aperçu de la vidéo",
  remaining: "Temps restant",
  permissionDenied: "Accès au micro ou à la caméra refusé.",
  insecureContext: "L'enregistrement nécessite une connexion sécurisée (HTTPS).",
  notSupported: "Ce navigateur ne peut pas enregistrer ce message.",
  fileTooLarge: "Le fichier dépasse la taille maximale autorisée.",
  noData: "Aucun son ni image n'a été enregistré.",
  screenUnsupported:
    "La capture d'écran n'est pas disponible sur ce navigateur. C'est souvent le cas sur Safari mobile.",
};

export type MediaRecorderPanelProps = {
  labels: MediaRecorderPanelLabels;
  phase: MediaRecorderPhase;
  mode: MediaRecorderMode | null;
  remainingMs: number;
  error: MediaRecorderErrorCode | null;
  recording: RecordedMedia | null;
  liveStream?: MediaCaptureStream | null;
  screenCaptureSupported: boolean;
  onStart: (mode: MediaRecorderMode) => void;
  onStop: () => void;
  onDiscard: () => void;
  onAccept: () => void;
  className?: string;
};

export function mediaRecorderErrorText(
  error: MediaRecorderErrorCode,
  labels: MediaRecorderPanelLabels,
  mode: MediaRecorderMode | null,
  screenCaptureSupported: boolean,
): string {
  if (
    error === "not_supported" &&
    mode === "screen" &&
    !screenCaptureSupported
  ) {
    return labels.screenUnsupported;
  }

  switch (error) {
    case "permission_denied":
      return labels.permissionDenied;
    case "insecure_context":
      return labels.insecureContext;
    case "file_too_large":
      return labels.fileTooLarge;
    case "no_data":
      return labels.noData;
    case "not_supported":
    case "capture_aborted":
      return labels.notSupported;
  }
}

export function MediaRecorderPanel({
  labels,
  phase,
  mode,
  remainingMs,
  error,
  recording,
  liveStream = null,
  screenCaptureSupported,
  onStart,
  onStop,
  onDiscard,
  onAccept,
  className,
}: MediaRecorderPanelProps) {
  const showCaptureActions = phase === "idle" || phase === "error";
  const showVideoPreview = phase === "recording" && mode !== "microphone";

  return (
    <div
      data-slot="media-recorder-panel"
      data-phase={phase}
      className={cn(
        "flex w-full max-w-md flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm",
        className,
      )}
    >
      {phase === "error" && error ? (
        <p role="alert" className="text-sm text-destructive">
          {mediaRecorderErrorText(error, labels, mode, screenCaptureSupported)}
        </p>
      ) : null}

      {showVideoPreview ? (
        liveStream ? (
          <LivePreview stream={liveStream} label={labels.livePreview} />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            {labels.livePreview}
          </div>
        )
      ) : null}

      {phase === "recording" ? (
        <p
          role="timer"
          aria-label={`${labels.remaining} ${formatRecorderClock(remainingMs)}`}
          className="font-mono text-3xl tabular-nums tracking-tight"
        >
          {formatRecorderClock(remainingMs)}
        </p>
      ) : null}

      {phase === "preview" && recording ? (
        <PreviewMedia recording={recording} labels={labels} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {showCaptureActions ? (
          <>
            <Button type="button" onClick={() => onStart("microphone")}>
              <Mic />
              {labels.microphone}
              <LimitHint ms={MESSAGE_AUDIO_MAX_DURATION_MS} />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onStart("camera")}
            >
              <Video />
              {labels.camera}
              <LimitHint ms={MESSAGE_VIDEO_MAX_DURATION_MS} />
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!screenCaptureSupported}
              title={
                screenCaptureSupported ? undefined : labels.screenUnsupported
              }
              onClick={() => onStart("screen")}
            >
              <Monitor />
              {labels.screen}
              <LimitHint ms={MESSAGE_VIDEO_MAX_DURATION_MS} />
            </Button>
          </>
        ) : null}

        {phase === "recording" ? (
          <Button type="button" variant="destructive" onClick={onStop}>
            <Square />
            {labels.stop}
          </Button>
        ) : null}

        {phase === "preview" ? (
          <>
            <Button type="button" variant="outline" onClick={onDiscard}>
              {labels.discard}
            </Button>
            <Button type="button" onClick={onAccept} disabled={!recording}>
              {labels.accept}
            </Button>
          </>
        ) : null}
      </div>

      {showCaptureActions &&
      !screenCaptureSupported &&
      !(error === "not_supported" && mode === "screen") ? (
        <p className="text-xs text-muted-foreground">{labels.screenUnsupported}</p>
      ) : null}
    </div>
  );
}

function LimitHint({ ms }: { ms: number }) {
  return (
    <span className="text-xs font-normal tabular-nums opacity-80">
      {formatRecorderClock(ms)}
    </span>
  );
}

function LivePreview({
  stream,
  label,
}: {
  stream: MediaCaptureStream;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    element.srcObject = stream as MediaStream;
    return () => {
      element.srcObject = null;
    };
  }, [stream]);

  return (
    <video
      ref={ref}
      aria-label={label}
      autoPlay
      muted
      playsInline
      className="aspect-video w-full rounded-lg bg-muted object-cover"
    />
  );
}

function PreviewMedia({
  recording,
  labels,
}: {
  recording: RecordedMedia;
  labels: MediaRecorderPanelLabels;
}) {
  if (recording.kind === "audio") {
    return (
      <audio
        controls
        src={recording.previewUrl}
        aria-label={labels.previewAudio}
        className="w-full"
      />
    );
  }

  return (
    <video
      controls
      playsInline
      src={recording.previewUrl}
      aria-label={labels.previewVideo}
      className="aspect-video w-full rounded-lg bg-muted"
    />
  );
}

/** Wires `useMediaRecorder` to the panel. Capture starts only after a button press. */
export function MediaRecorderSession({
  labels,
  onAccept,
  className,
}: {
  labels: MediaRecorderPanelLabels;
  onAccept?: (recording: RecordedMedia) => void;
  className?: string;
}) {
  const recorder = useMediaRecorder();

  return (
    <MediaRecorderPanel
      labels={labels}
      phase={recorder.phase}
      mode={recorder.mode}
      remainingMs={recorder.remainingMs}
      error={recorder.error}
      recording={recorder.recording}
      liveStream={recorder.liveStream}
      screenCaptureSupported={recorder.screenCaptureSupported}
      onStart={(mode) => {
        void recorder.start(mode);
      }}
      onStop={recorder.stop}
      onDiscard={recorder.discard}
      onAccept={() => {
        if (recorder.recording) {
          onAccept?.(recorder.recording);
        }
      }}
      className={className}
    />
  );
}
