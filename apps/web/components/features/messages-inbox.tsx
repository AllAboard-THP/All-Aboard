"use client";

import type { ConversationInboxItem } from "@allaboard/types";
import { useTranslations } from "next-intl";

import { Badge } from "@allaboard/ui/components/badge";
import { cn } from "@allaboard/ui/lib/utils";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  items: ConversationInboxItem[];
  selectedId: string | null;
  locale: AppLocale;
};

function participantInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function inboxPreview(
  item: ConversationInboxItem,
  t: (key: "previewVoice" | "previewVideo") => string,
): string {
  const lastMessage = item.lastMessage;
  if (lastMessage?.kind === "audio" && !lastMessage.body) {
    return t("previewVoice");
  }
  if (lastMessage?.kind === "video" && !lastMessage.body) {
    return t("previewVideo");
  }
  if (lastMessage?.body) {
    return lastMessage.body;
  }
  if (item.topic) {
    return item.topic;
  }
  return "";
}

function InboxKindIcon({ kind }: { kind: "audio" | "video" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-testid="messages-inbox-kind"
      data-kind={kind}
    >
      {kind === "audio" ? (
        <>
          <path d="M12 19v3" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <rect x="9" y="2" width="6" height="13" rx="3" />
        </>
      ) : (
        <>
          <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
          <rect x="2" y="6" width="14" height="12" rx="2" />
        </>
      )}
    </svg>
  );
}

export function MessagesInbox({ items, selectedId, locale }: Props) {
  const t = useTranslations("messages");

  return (
    <div className="flex min-h-0 flex-col" data-testid="messages-inbox">
      <div className="border-b border-border p-4">
        <h1 className="m-0 text-xl font-semibold text-foreground">
          {t("title")}
        </h1>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        aria-label={t("inboxAria")}
      >
        {items.length === 0 ? (
          <p className="m-0 p-4 text-sm text-muted-foreground">
            {t("emptyInbox")}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-2">
            {items.map((item) => {
              const active = item.id === selectedId;
              const peer = item.otherParticipant;
              const avatar = peer.avatarUrl?.trim() || null;
              const preview = inboxPreview(item, t);
              const mediaKind =
                item.lastMessage?.kind === "audio" ||
                item.lastMessage?.kind === "video"
                  ? item.lastMessage.kind
                  : null;

              return (
                <li key={item.id}>
                  <Link
                    href={`/messages/${item.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      active ?
                        "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60",
                    )}
                    aria-current={active ? "true" : undefined}
                    data-testid="messages-inbox-item"
                  >
                    {avatar ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt={peer.displayName}
                        className="size-10 shrink-0 rounded-full object-cover"
                      />
                    : <div
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                      >
                        {participantInitials(peer.displayName)}
                      </div>
                    }
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {peer.displayName}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {formatDateTime(item.updatedAt, locale)}
                        </span>
                      </div>
                      {item.topic ? (
                        <p className="m-0 truncate text-xs text-muted-foreground">
                          {item.topic}
                        </p>
                      ) : null}
                      {preview ? (
                        <p
                          className="m-0 flex min-w-0 items-center gap-1 text-xs text-muted-foreground"
                          data-testid="messages-inbox-preview"
                        >
                          {mediaKind ? <InboxKindIcon kind={mediaKind} /> : null}
                          <span className="truncate">{preview}</span>
                        </p>
                      ) : null}
                    </div>
                    {item.unreadCount > 0 ? (
                      <Badge
                        variant="destructive"
                        className="shrink-0"
                        data-testid="messages-inbox-unread"
                      >
                        {item.unreadCount}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
