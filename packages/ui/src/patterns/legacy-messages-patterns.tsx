"use client";

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

export function ConversationListItem({
  conversation,
  labels = legacyLabelsFr,
  className,
}: {
  conversation: LegacyConversation;
  labels?: LegacyLabels;
  className?: string;
}) {
  const preview =
    conversation.preview === "Commencez la conversation" ||
    conversation.preview === "Start the conversation"
      ? labels.messages.startConversation
      : conversation.preview;

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
        conversation.active
          ? "border border-primary/30 bg-primary/20"
          : "hover:bg-white/5",
        className,
      )}
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
  labels = legacyLabelsFr,
  className,
}: {
  conversations?: LegacyConversation[];
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1 p-3", className)}>
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
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

export function MessagesInboxLayout({
  conversations = legacyConversations,
  labels = legacyLabelsFr,
  className,
}: {
  conversations?: LegacyConversation[];
  labels?: LegacyLabels;
  className?: string;
}) {
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
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList conversations={conversations} labels={labels} />
        </div>
      </div>
      <MessagesEmptyState labels={labels} className="hidden md:flex" />
    </div>
  );
}
