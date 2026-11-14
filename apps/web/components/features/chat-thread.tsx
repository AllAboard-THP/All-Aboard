"use client";

import type { ChatMessage } from "@allaboard/types";
import type { RecordedMedia } from "@allaboard/ui/hooks/media-recorder";
import { cn } from "@allaboard/ui/lib/utils";
import {
  ChatComposerSession,
  type ChatComposerLabels,
} from "@allaboard/ui/patterns/chat-composer";
import {
  ChatMessageContent,
  type ChatBubbleLabels,
} from "@allaboard/ui/patterns/chat-message-bubbles";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AppLocale } from "@/i18n/routing";
import {
  buildChatMediaFormData,
  fetchConversationWsToken,
  markConversationRead,
  parseChatWsMessage,
  sendChatMediaMessage,
  sendChatMessage,
} from "@/lib/chat-client";
import { buildConversationWsUrl } from "@/lib/public-api-url";

type CurrentUser = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
};

type Props = {
  conversationId: string;
  initialMessages: ChatMessage[];
  currentUser: CurrentUser;
  locale: AppLocale;
  peerDisplayName: string;
  peerAvatarUrl?: string;
};

type DisplayMessage = ChatMessage & { optimistic?: boolean };

function formatMessageTime(iso: string, locale: AppLocale): string {
  const bcp47 = locale === "fr" ? "fr-FR" : "en-US";
  return new Date(iso).toLocaleTimeString(bcp47, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function participantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function upsertMessage(
  messages: DisplayMessage[],
  message: ChatMessage,
): DisplayMessage[] {
  if (messages.some((m) => m.id === message.id)) {
    return messages;
  }
  const withoutOptimisticDup = messages.filter((existing) => {
    if (!existing.optimistic || existing.userId !== message.userId) return true;
    if (existing.kind !== message.kind) return true;
    return existing.body !== message.body;
  });
  return [...withoutOptimisticDup, message];
}

function replaceOptimistic(
  messages: DisplayMessage[],
  optimisticId: string,
  message: ChatMessage,
): DisplayMessage[] {
  const hasReal = messages.some((item) => item.id === message.id);
  if (hasReal) {
    return messages.filter((item) => item.id !== optimisticId);
  }
  return messages.map((item) => (item.id === optimisticId ? message : item));
}

export function ChatThread({
  conversationId,
  initialMessages,
  currentUser,
  locale,
  peerDisplayName,
  peerAvatarUrl,
}: Props) {
  const t = useTranslations("messages");
  const [messages, setMessages] = useState<DisplayMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  const bubbleLabels: ChatBubbleLabels = {
    voiceMessage: t("previewVoice"),
    videoMessage: t("previewVideo"),
    sending: t("sendPending"),
    duration: t("duration"),
  };

  const composerLabels: ChatComposerLabels = {
    send: t("send"),
    sendPending: t("sendPending"),
    sendLabel: t("sendLabel"),
    sendPlaceholder: t("sendPlaceholder"),
    sendError: t("sendError"),
    retry: t("retrySend"),
    uploadProgress: t("uploadProgress"),
    captionPlaceholder: t("captionPlaceholder"),
    microphone: t("microphone"),
    camera: t("camera"),
    screen: t("screen"),
    stop: t("stopRecording"),
    discard: t("discardRecording"),
    livePreview: t("recorderLivePreview"),
    previewAudio: t("recorderPreviewAudio"),
    previewVideo: t("recorderPreviewVideo"),
    remaining: t("recorderRemaining"),
    permissionDenied: t("recorderPermissionDenied"),
    insecureContext: t("recorderInsecureContext"),
    notSupported: t("recorderNotSupported"),
    fileTooLarge: t("recorderFileTooLarge"),
    noData: t("recorderNoData"),
    screenUnsupported: t("recorderScreenUnsupported"),
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markConversationRead(conversationId).catch(() => {
      /* non-blocking */
    });
  }, [conversationId]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    async function connect() {
      if (disposed) return;
      try {
        const { token } = await fetchConversationWsToken(conversationId);
        if (disposed) return;
        const url = buildConversationWsUrl(conversationId, token);
        ws = new WebSocket(url);

        ws.onmessage = (event) => {
          try {
            const message = parseChatWsMessage(JSON.parse(String(event.data)));
            if (!message) return;
            setMessages((prev) => upsertMessage(prev, message));
          } catch {
            /* ignore malformed payloads */
          }
        };

        ws.onclose = () => {
          if (!disposed) {
            reconnectTimer = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch {
        if (!disposed) {
          reconnectTimer = setTimeout(() => {
            connect();
          }, 5000);
        }
      }
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [conversationId]);

  const sendText = useCallback(
    async (body: string) => {
      const requestConversationId = conversationId;
      const optimistic: DisplayMessage = {
        id: `opt-${Date.now()}`,
        kind: "text",
        body,
        userId: currentUser.userId,
        userName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        createdAt: new Date().toISOString(),
        type: "message",
        optimistic: true,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const { item } = await sendChatMessage(conversationId, body);
        if (conversationIdRef.current !== requestConversationId) return;
        setMessages((prev) => replaceOptimistic(prev, optimistic.id, item));
      } catch (error) {
        if (conversationIdRef.current === requestConversationId) {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        }
        throw error;
      }
    },
    [conversationId, currentUser],
  );

  const sendMedia = useCallback(
    async (
      recording: RecordedMedia,
      caption: string,
      onProgress: (percent: number) => void,
    ) => {
      const requestConversationId = conversationId;
      const optimistic: DisplayMessage = {
        id: `opt-${Date.now()}`,
        kind: recording.kind,
        body: caption || undefined,
        attachment: {
          url: recording.previewUrl,
          mimeType: recording.mimeType,
          sizeBytes: recording.blob.size,
          durationMs: recording.durationMs,
          source: recording.source,
        },
        userId: currentUser.userId,
        userName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        createdAt: new Date().toISOString(),
        type: "message",
        optimistic: true,
      };

      setMessages((prev) => [...prev, optimistic]);

      try {
        const { item } = await sendChatMediaMessage(
          conversationId,
          buildChatMediaFormData(recording, caption),
          { onProgress },
        );
        if (conversationIdRef.current !== requestConversationId) return;
        setMessages((prev) => replaceOptimistic(prev, optimistic.id, item));
      } catch (error) {
        if (conversationIdRef.current === requestConversationId) {
          setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        }
        throw error;
      }
    },
    [conversationId, currentUser],
  );

  const peerAvatar = peerAvatarUrl?.trim() ? peerAvatarUrl.trim() : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="chat-thread">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        {peerAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- peer avatar URL
          <img
            src={peerAvatar}
            alt={peerDisplayName}
            className="size-10 rounded-full border border-border object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-muted-foreground"
          >
            {participantInitials(peerDisplayName)}
          </div>
        )}
        <h2 className="m-0 text-base font-semibold text-foreground">
          {peerDisplayName}
        </h2>
      </header>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-label={t("threadMessagesAria")}
      >
        {messages.map((msg) => {
          const isMine = msg.userId === currentUser.userId;
          const avatar = isMine
            ? currentUser.avatarUrl?.trim() || null
            : peerAvatar;
          const name = isMine ? currentUser.displayName : peerDisplayName;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex items-end gap-2",
                isMine ? "flex-row-reverse" : "flex-row",
              )}
              data-testid="chat-message"
            >
              {!isMine &&
                (avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    className="mb-1 size-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
                  >
                    {participantInitials(name)}
                  </div>
                ))}
              <div
                className={cn(
                  "flex max-w-[70%] flex-col gap-0.5",
                  isMine ? "items-end" : "items-start",
                )}
              >
                <ChatMessageContent
                  message={{
                    kind: msg.kind,
                    body: msg.body,
                    attachmentUrl: msg.attachment?.url,
                    durationMs: msg.attachment?.durationMs,
                    pending: msg.optimistic,
                  }}
                  mine={isMine}
                  labels={bubbleLabels}
                />
                <span className="px-1 text-[10px] text-muted-foreground">
                  {formatMessageTime(msg.createdAt, locale)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatComposerSession
        key={conversationId}
        labels={composerLabels}
        onSendText={sendText}
        onSendMedia={sendMedia}
      />
    </div>
  );
}
