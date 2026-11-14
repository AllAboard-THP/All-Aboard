"use client";

import { Mic, Monitor, Square, Video } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
import {
  mediaRecorderErrorText,
  type MediaRecorderPanelLabels,
} from "./media-recorder-panel";

export type ChatComposerPhase = MediaRecorderPhase | "uploading";

export type ChatComposerLabels = {
  send: string;
  sendPending: string;
  sendLabel: string;
  sendPlaceholder: string;
  sendError: string;
  retry: string;
  uploadProgress: string;
  captionPlaceholder: string;
  microphone: string;
  camera: string;
  screen: string;
  stop: string;
  discard: string;
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

export const chatComposerLabelsFr: ChatComposerLabels = {
  send: "Envoyer",
  sendPending: "Envoi…",
  sendLabel: "Votre message",
  sendPlaceholder: "Écrire un message…",
  sendError: "Le message n'a pas pu être envoyé. Réessayez.",
  retry: "Réessayer",
  uploadProgress: "Envoi du message",
  captionPlaceholder: "Ajouter une légende…",
  microphone: "Micro",
  camera: "Caméra",
  screen: "Écran",
  stop: "Arrêter",
  discard: "Annuler",
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

export type ChatComposerProps = {
  labels: ChatComposerLabels;
  phase: ChatComposerPhase;
  mode: MediaRecorderMode | null;
  remainingMs: number;
  error: MediaRecorderErrorCode | null;
  recording: RecordedMedia | null;
  liveStream?: MediaCaptureStream | null;
  screenCaptureSupported: boolean;
  input: string;
  caption: string;
  uploadProgress: number;
  uploadError: string | null;
  textError: string | null;
  sendingText: boolean;
  onInputChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
  onSubmitText: () => void;
  onStart: (mode: MediaRecorderMode) => void;
  onStop: () => void;
  onDiscard: () => void;
  onSendMedia: () => void;
  className?: string;
};

function toRecorderLabels(labels: ChatComposerLabels): MediaRecorderPanelLabels {
  return {
    microphone: labels.microphone,
    camera: labels.camera,
    screen: labels.screen,
    stop: labels.stop,
    discard: labels.discard,
    accept: labels.send,
    livePreview: labels.livePreview,
    previewAudio: labels.previewAudio,
    previewVideo: labels.previewVideo,
    remaining: labels.remaining,
    permissionDenied: labels.permissionDenied,
    insecureContext: labels.insecureContext,
    notSupported: labels.notSupported,
    fileTooLarge: labels.fileTooLarge,
    noData: labels.noData,
    screenUnsupported: labels.screenUnsupported,
  };
}

export function ChatComposer({
  labels,
  phase,
  mode,
  remainingMs,
  error,
  recording,
  liveStream = null,
  screenCaptureSupported,
  input,
  caption,
  uploadProgress,
  uploadError,
  textError,
  sendingText,
  onInputChange,
  onCaptionChange,
  onSubmitText,
  onStart,
  onStop,
  onDiscard,
  onSendMedia,
  className,
}: ChatComposerProps) {
  const showIdleRow = phase === "idle" || phase === "error";
  const showVideoPreview = phase === "recording" && mode !== "microphone";
  const busy = sendingText || phase === "uploading";
  const alertMessage =
    uploadError ??
    textError ??
    (phase === "error" && error
      ? mediaRecorderErrorText(
          error,
          toRecorderLabels(labels),
          mode,
          screenCaptureSupported,
        )
      : null);

  return (
    <div
      data-slot="chat-composer"
      data-phase={phase}
      aria-busy={phase === "uploading" || sendingText}
      className={cn("flex w-full flex-col gap-3 border-t border-border p-4", className)}
    >
      {alertMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {alertMessage}
        </p>
      ) : null}

      {showVideoPreview ? (
        liveStream ? (
          <LivePreview stream={liveStream} label={labels.livePreview} />
        ) : (
          <div className="flex aspect-video w-full max-w-sm items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
            {labels.livePreview}
          </div>
        )
      ) : null}

      {phase === "recording" ? (
        <div className="flex items-center gap-3">
          <p
            role="timer"
            aria-label={`${labels.remaining} ${formatRecorderClock(remainingMs)}`}
            className="font-mono text-2xl tabular-nums tracking-tight"
          >
            {formatRecorderClock(remainingMs)}
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onStop}
            data-testid="chat-stop-recording"
          >
            <Square />
            {labels.stop}
          </Button>
        </div>
      ) : null}

      {phase === "preview" || phase === "uploading" ? (
        recording ? (
          <div className="flex max-w-md flex-col gap-2">
            <PreviewMedia recording={recording} labels={labels} />
            <label className="sr-only" htmlFor="chat-caption-input">
              {labels.captionPlaceholder}
            </label>
            <input
              id="chat-caption-input"
              type="text"
              value={caption}
              onChange={(event) => onCaptionChange(event.target.value)}
              placeholder={labels.captionPlaceholder}
              disabled={phase === "uploading"}
              data-testid="chat-caption-input"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        ) : null
      ) : null}

      {phase === "uploading" ? (
        <UploadProgress labels={labels} progress={uploadProgress} />
      ) : null}

      {phase === "preview" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            data-testid="chat-discard-recording"
          >
            {labels.discard}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSendMedia}
            disabled={!recording}
            data-testid="chat-send-media"
          >
            {uploadError ? labels.retry : labels.send}
          </Button>
        </div>
      ) : null}

      {showIdleRow ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy) {
              onSubmitText();
            }
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <CaptureButton
            label={labels.microphone}
            limitMs={MESSAGE_AUDIO_MAX_DURATION_MS}
            testId="chat-record-microphone"
            disabled={busy}
            onClick={() => onStart("microphone")}
          >
            <Mic />
          </CaptureButton>
          <CaptureButton
            label={labels.camera}
            limitMs={MESSAGE_VIDEO_MAX_DURATION_MS}
            testId="chat-record-camera"
            disabled={busy}
            onClick={() => onStart("camera")}
          >
            <Video />
          </CaptureButton>
          <CaptureButton
            label={labels.screen}
            limitMs={MESSAGE_VIDEO_MAX_DURATION_MS}
            testId="chat-record-screen"
            disabled={busy || !screenCaptureSupported}
            title={screenCaptureSupported ? undefined : labels.screenUnsupported}
            onClick={() => onStart("screen")}
          >
            <Monitor />
          </CaptureButton>
          <label className="sr-only" htmlFor="chat-message-input">
            {labels.sendLabel}
          </label>
          <input
            id="chat-message-input"
            type="text"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={labels.sendPlaceholder}
            disabled={busy}
            data-testid="chat-message-input"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button
            type="submit"
            size="sm"
            disabled={busy || input.trim().length === 0}
            data-testid="chat-send-button"
          >
            {sendingText ? labels.sendPending : labels.send}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function CaptureButton({
  label,
  limitMs,
  testId,
  disabled,
  title,
  onClick,
  children,
}: {
  label: string;
  limitMs: number;
  testId: string;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const limit = formatRecorderClock(limitMs);
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled}
      title={title ?? `${label} (${limit})`}
      aria-label={label}
      data-testid={testId}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function UploadProgress({
  labels,
  progress,
}: {
  labels: ChatComposerLabels;
  progress: number;
}) {
  const safe = Math.min(100, Math.max(0, Math.round(progress)));
  return (
    <div className="flex max-w-md flex-col gap-1">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safe}
        aria-label={labels.uploadProgress}
        data-testid="chat-upload-progress"
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary" style={{ width: `${safe}%` }} />
      </div>
      <p className="m-0 text-xs text-muted-foreground">
        {labels.sendPending} {safe}%
      </p>
    </div>
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
      className="aspect-video w-full max-w-sm rounded-lg bg-muted object-cover"
    />
  );
}

function PreviewMedia({
  recording,
  labels,
}: {
  recording: RecordedMedia;
  labels: ChatComposerLabels;
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

/** Wires recording to the composer. Capture starts only after a button press. */
export function ChatComposerSession({
  labels,
  onSendText,
  onSendMedia,
  className,
}: {
  labels: ChatComposerLabels;
  onSendText: (body: string) => Promise<void>;
  onSendMedia: (
    recording: RecordedMedia,
    caption: string,
    onProgress: (percent: number) => void,
  ) => Promise<void>;
  className?: string;
}) {
  const recorder = useMediaRecorder();
  const [input, setInput] = useState("");
  const [caption, setCaption] = useState("");
  const [sendingText, setSendingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const phase: ChatComposerPhase = uploading ? "uploading" : recorder.phase;

  async function submitText() {
    const body = input.trim();
    if (
      !body ||
      sendingText ||
      uploading ||
      recorder.phase === "recording" ||
      recorder.phase === "preview"
    ) {
      return;
    }
    const previous = input;
    setInput("");
    setSendingText(true);
    setTextError(null);
    try {
      await onSendText(body);
    } catch {
      setInput(previous);
      setTextError(labels.sendError);
    } finally {
      setSendingText(false);
    }
  }

  async function submitMedia() {
    const recording = recorder.recording;
    if (!recording || uploading) {
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      await onSendMedia(recording, caption.trim(), setUploadProgress);
      setCaption("");
      recorder.discard();
    } catch {
      setUploadError(labels.sendError);
    } finally {
      setUploading(false);
    }
  }

  return (
    <ChatComposer
      labels={labels}
      phase={phase}
      mode={recorder.mode}
      remainingMs={recorder.remainingMs}
      error={recorder.error}
      recording={recorder.recording}
      liveStream={recorder.liveStream}
      screenCaptureSupported={recorder.screenCaptureSupported}
      input={input}
      caption={caption}
      uploadProgress={uploadProgress}
      uploadError={uploadError}
      textError={textError}
      sendingText={sendingText}
      onInputChange={setInput}
      onCaptionChange={setCaption}
      onSubmitText={() => {
        void submitText();
      }}
      onStart={(mode) => {
        setTextError(null);
        setUploadError(null);
        void recorder.start(mode);
      }}
      onStop={recorder.stop}
      onDiscard={() => {
        setCaption("");
        setUploadError(null);
        recorder.discard();
      }}
      onSendMedia={() => {
        void submitMedia();
      }}
      className={className}
    />
  );
}
