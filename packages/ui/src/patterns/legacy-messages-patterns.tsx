"use client";

import { useMemo, useState } from "react";
import { MessagesSquare, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Input } from "../components/input";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  legacyConversations,
  type LegacyConversation,
} from "./fixtures/legacy-conversations";
import { QuickReply } from "./legacy-feed-patterns";

function resolveConversationPreview(
  conversation: LegacyConversation,
  labels: LegacyLabels,
) {
  if (
    conversation.preview === "Commencez la conversation" ||
    conversation.preview === "Start the conversation"
  ) {
    return labels.messages.startConversation;
  }

  return conversation.preview;
}

export function ConversationListItem({
  conversation,
  selected = false,
  onSelect,
  labels = legacyLabelsFr,
  className,
}: {
  conversation: LegacyConversation;
  selected?: boolean;
  onSelect?: (id: string) => void;
  labels?: LegacyLabels;
  className?: string;
}) {
  const preview = resolveConversationPreview(conversation, labels);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
        selected
          ? "border border-primary/30 bg-primary/20"
          : "hover:bg-white/5",
        className,
      )}
      onClick={() => onSelect?.(conversation.id)}
    >
      <div className="relative">
        <Avatar className="size-12">
          <AvatarFallback>{conversation.peerInitials}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute right-0 bottom-0 size-3 rounded-full border-2 border-background",
            conversation.online ? "bg-green-500" : "bg-muted-foreground",
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h4 className="truncate text-sm font-semibold">
            {conversation.peerName}
          </h4>
          <span className="text-xs text-muted-foreground">
            {conversation.timeAgo}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">{preview}</p>
      </div>

      {conversation.unreadCount && conversation.unreadCount > 0 ? (
        <span className="flex size-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
          {conversation.unreadCount}
        </span>
      ) : null}
    </button>
  );
}

export function ConversationList({
  conversations = legacyConversations,
  selectedId,
  onSelect,
  labels = legacyLabelsFr,
  className,
}: {
  conversations?: LegacyConversation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1 p-3", className)}>
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          selected={selectedId === conversation.id}
          onSelect={onSelect}
          labels={labels}
        />
      ))}
    </div>
  );
}

export function MessagesEmptyState({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center bg-black/20 text-center text-muted-foreground",
        className,
      )}
    >
      <div>
        <MessagesSquare className="mx-auto mb-3 size-10 opacity-60" />
        <p>{labels.messages.emptySelection}</p>
      </div>
    </div>
  );
}

function MessageThreadPanel({
  conversation,
  labels,
}: {
  conversation: LegacyConversation;
  labels: LegacyLabels;
}) {
  const preview = resolveConversationPreview(conversation, labels);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <Avatar className="size-10">
          <AvatarFallback>{conversation.peerInitials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{conversation.peerName}</p>
          <p className="text-xs text-muted-foreground">{conversation.timeAgo}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-4 p-4">
        <div className="max-w-md rounded-2xl bg-white/10 px-4 py-3 text-sm text-muted-foreground">
          {preview}
        </div>
        <QuickReply
          placeholder={labels.feed.quickReplyPlaceholder}
          submitLabel={labels.feed.quickReplySubmit}
          userInitials="AA"
        />
      </div>
    </div>
  );
}

export function MessagesInboxLayout({
  conversations = legacyConversations,
  labels = legacyLabelsFr,
  className,
}: {
  conversations?: LegacyConversation[];
  labels?: LegacyLabels;
  className?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations.find((conversation) => conversation.active)?.id ?? null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) =>
      conversation.peerName.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ??
    null;

  return (
    <div
      className={cn(
        "glass flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl",
        className,
      )}
    >
      <div className="flex w-full flex-col border-r border-white/10 md:w-80">
        <div className="border-b border-white/10 p-4">
          <h2 className="mb-4 text-xl font-bold">{labels.messages.title}</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={labels.messages.searchPlaceholder}
              className="rounded-xl border-white/10 bg-white/5 pl-10"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            <ConversationList
              conversations={filteredConversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              labels={labels}
            />
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {labels.messages.emptySelection}
            </p>
          )}
        </div>
      </div>
      {selectedConversation ? (
        <MessageThreadPanel
          conversation={selectedConversation}
          labels={labels}
        />
      ) : (
        <MessagesEmptyState labels={labels} className="hidden md:flex" />
      )}
    </div>
  );
}
