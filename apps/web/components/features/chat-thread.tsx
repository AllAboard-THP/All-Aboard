"use client";

import type { ChatMessage } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";

import {
  fetchConversationWsToken,
  markConversationRead,
  sendChatMessage,
} from "@/lib/chat-client";
import type { AppLocale } from "@/i18n/routing";
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
  const withoutOptimisticDup = messages.filter(
    (m) => !m.optimistic || m.body !== message.body || m.userId !== message.userId,
  );
  return [...withoutOptimisticDup, message];
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
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
            const data = JSON.parse(String(event.data)) as ChatMessage;
            if (data.type !== "message" || typeof data.id !== "string") return;
            setMessages((prev) => upsertMessage(prev, data));
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

  const sendMessage = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      const body = input.trim();
      if (!body || sending) return;

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
      setInput("");
      setSending(true);
      setSendError(null);

      try {
        const { item } = await sendChatMessage(conversationId, body);
        setMessages((prev) => upsertMessage(prev, item));
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setInput(body);
        setSendError(t("sendError"));
      } finally {
        setSending(false);
      }
    },
    [conversationId, currentUser, input, sending, t],
  );

  const peerAvatar =
    peerAvatarUrl?.trim() ? peerAvatarUrl.trim() : null;

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
          const avatar =
            isMine ?
              currentUser.avatarUrl?.trim() || null
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
              {!isMine && (
                avatar ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={name}
                    className="mb-1 size-7 shrink-0 rounded-full object-cover"
                  />
                : <div
                    aria-hidden
                    className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
                  >
                    {participantInitials(name)}
                  </div>
              )}
              <div
                className={cn(
                  "flex max-w-[70%] flex-col gap-0.5",
                  isMine ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isMine ?
                      "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                    msg.optimistic && "opacity-70",
                  )}
                >
                  {msg.body ??
                    (msg.kind === "audio" ?
                      t("previewVoice")
                    : msg.kind === "video" ?
                      t("previewVideo")
                    : "")}
                </div>
                <span className="px-1 text-[10px] text-muted-foreground">
                  {formatMessageTime(msg.createdAt, locale)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex items-center gap-3 border-t border-border p-4"
      >
        <label className="sr-only" htmlFor="chat-message-input">
          {t("sendLabel")}
        </label>
        <input
          id="chat-message-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("sendPlaceholder")}
          disabled={sending}
          data-testid="chat-message-input"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="submit"
          size="sm"
          disabled={sending || input.trim().length === 0}
          data-testid="chat-send-button"
        >
          {sending ? t("sendPending") : t("send")}
        </Button>
      </form>
      {sendError ? (
        <p className="px-4 pb-3 text-sm text-destructive" role="alert">
          {sendError}
        </p>
      ) : null}
    </div>
  );
}
