"use client";

import { formatRecorderClock } from "../hooks/media-recorder";
import { cn } from "../lib/utils";

export type ChatBubbleLabels = {
  voiceMessage: string;
  videoMessage: string;
  sending: string;
  duration: string;
};

export const chatBubbleLabelsFr: ChatBubbleLabels = {
  voiceMessage: "Message vocal",
  videoMessage: "Message vidéo",
  sending: "Envoi…",
  duration: "Durée",
};

export type ChatRenderedMessage = {
  kind: "text" | "audio" | "video";
  body?: string;
  attachmentUrl?: string;
  durationMs?: number;
  posterUrl?: string;
  pending?: boolean;
};

type BubbleFrame = {
  mine?: boolean;
  pending?: boolean;
  className?: string;
};

function textBubbleClass(mine: boolean | undefined, pending: boolean | undefined) {
  return cn(
    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
    mine
      ? "rounded-br-sm bg-primary text-primary-foreground"
      : "rounded-bl-sm bg-muted text-foreground",
    pending && "opacity-70",
  );
}

function mediaBubbleClass(mine: boolean | undefined, pending: boolean | undefined) {
  return cn(
    "flex w-full min-w-56 flex-col gap-2 rounded-2xl border px-3 py-2 text-sm text-foreground",
    mine
      ? "rounded-br-sm border-primary/30 bg-primary/10"
      : "rounded-bl-sm border-border bg-muted",
    pending && "opacity-70",
  );
}

function PendingBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium opacity-80">
      {label}
    </span>
  );
}

function DurationLabel({
  durationMs,
  label,
}: {
  durationMs?: number;
  label: string;
}) {
  if (durationMs == null) {
    return null;
  }
  const clock = formatRecorderClock(durationMs);
  return (
    <span className="text-xs tabular-nums text-muted-foreground" aria-label={`${label} ${clock}`}>
      {clock}
    </span>
  );
}

export function TextBubble({
  body,
  mine,
  pending,
  sendingLabel,
  className,
}: BubbleFrame & { body: string; sendingLabel?: string }) {
  return (
    <div
      data-slot="text-bubble"
      className={cn(textBubbleClass(mine, pending), className)}
    >
      <p className="m-0 whitespace-pre-wrap">{body}</p>
      {pending && sendingLabel ? <PendingBadge label={sendingLabel} /> : null}
    </div>
  );
}

export function AudioBubble({
  src,
  durationMs,
  caption,
  mine,
  pending,
  labels,
  className,
}: BubbleFrame & {
  src: string;
  durationMs?: number;
  caption?: string;
  labels: ChatBubbleLabels;
}) {
  return (
    <div
      data-slot="audio-bubble"
      className={cn(mediaBubbleClass(mine, pending), className)}
    >
      <audio
        controls
        preload="metadata"
        src={src}
        aria-label={labels.voiceMessage}
        className="h-10 w-full"
      />
      <div className="flex items-center justify-between gap-2">
        <DurationLabel durationMs={durationMs} label={labels.duration} />
        {pending ? <PendingBadge label={labels.sending} /> : null}
      </div>
      {caption ? <p className="m-0 whitespace-pre-wrap">{caption}</p> : null}
    </div>
  );
}

export function VideoBubble({
  src,
  poster,
  durationMs,
  caption,
  mine,
  pending,
  labels,
  className,
}: BubbleFrame & {
  src: string;
  poster?: string;
  durationMs?: number;
  caption?: string;
  labels: ChatBubbleLabels;
}) {
  return (
    <div
      data-slot="video-bubble"
      className={cn(mediaBubbleClass(mine, pending), "min-w-64", className)}
    >
      <video
        controls
        playsInline
        preload="metadata"
        src={src}
        poster={poster}
        aria-label={labels.videoMessage}
        className="aspect-video w-full rounded-lg bg-black object-contain"
      />
      <div className="flex items-center justify-between gap-2">
        <DurationLabel durationMs={durationMs} label={labels.duration} />
        {pending ? <PendingBadge label={labels.sending} /> : null}
      </div>
      {caption ? <p className="m-0 whitespace-pre-wrap">{caption}</p> : null}
    </div>
  );
}

export function ChatMessageContent({
  message,
  mine,
  labels,
}: {
  message: ChatRenderedMessage;
  mine?: boolean;
  labels: ChatBubbleLabels;
}) {
  if (message.kind === "audio") {
    if (!message.attachmentUrl) {
      return (
        <TextBubble
          body={message.body || labels.voiceMessage}
          mine={mine}
          pending={message.pending}
          sendingLabel={labels.sending}
        />
      );
    }
    return (
      <AudioBubble
        src={message.attachmentUrl}
        durationMs={message.durationMs}
        caption={message.body}
        mine={mine}
        pending={message.pending}
        labels={labels}
      />
    );
  }

  if (message.kind === "video") {
    if (!message.attachmentUrl) {
      return (
        <TextBubble
          body={message.body || labels.videoMessage}
          mine={mine}
          pending={message.pending}
          sendingLabel={labels.sending}
        />
      );
    }
    return (
      <VideoBubble
        src={message.attachmentUrl}
        poster={message.posterUrl}
        durationMs={message.durationMs}
        caption={message.body}
        mine={mine}
        pending={message.pending}
        labels={labels}
      />
    );
  }

  return (
    <TextBubble
      body={message.body ?? ""}
      mine={mine}
      pending={message.pending}
      sendingLabel={labels.sending}
    />
  );
}
