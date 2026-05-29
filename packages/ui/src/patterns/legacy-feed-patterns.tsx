"use client";

import {
  ArrowRight,
  ArrowUp,
  CircleHelp,
  History,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../components/avatar";
import { Button } from "../components/button";
import { Input } from "../components/input";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import { legacySubjects } from "./fixtures/legacy-subjects";
import { PostCardCodeBlock } from "./post-card";

export function CommentCard({
  authorName,
  authorInitials,
  timeAgo,
  body,
  code,
  className,
}: {
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  body: string;
  code?: { language: string; snippet: string };
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{authorName}</span>
          <span className="ml-2 text-xs text-muted-foreground">{timeAgo}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        {code ? (
          <PostCardCodeBlock
            language={code.language}
            snippet={code.snippet}
            className="mt-2"
          />
        ) : null}
      </div>
    </div>
  );
}

export function QuickReply({
  placeholder,
  submitLabel,
  userInitials = "YL",
  className,
}: {
  placeholder: string;
  submitLabel: string;
  userInitials?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 gap-2">
        <Input
          placeholder={placeholder}
          className="rounded-xl border-white/10 bg-black/30"
        />
        <Button className="shrink-0 rounded-xl">{submitLabel}</Button>
      </div>
    </div>
  );
}

export function SidebarPanel({
  title,
  icon: Icon,
  count,
  children,
  className,
}: {
  title: string;
  icon: typeof History;
  count?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="font-semibold text-gray-300">{title}</h3>
        {count !== undefined ? (
          <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
            {count}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function SidebarEmptyState({
  message,
  icon: Icon = Sparkles,
  iconClassName = "text-primary",
}: {
  message: string;
  icon?: typeof Sparkles;
  iconClassName?: string;
}) {
  return (
    <div className="py-4 text-center text-muted-foreground">
      <Icon className={cn("mx-auto mb-2 block size-8", iconClassName)} />
      <p className="text-xs">{message}</p>
    </div>
  );
}

export function UnansweredListItem({
  title,
  authorName,
  authorInitials,
  subjectName,
  accentColor,
  timeAgo,
}: {
  title: string;
  authorName: string;
  authorInitials: string;
  subjectName: string;
  accentColor: string;
  timeAgo: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}18`,
          }}
        >
          {subjectName}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {timeAgo}
        </span>
      </div>
      <p className="line-clamp-2 text-xs text-gray-300">{title}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <Avatar className="size-4">
          <AvatarFallback className="text-[8px]">{authorInitials}</AvatarFallback>
        </Avatar>
        <span className="text-[10px] text-muted-foreground">{authorName}</span>
      </div>
    </div>
  );
}

export function ContributionListItem({
  postTitle,
  commentBody,
  subjectName,
  accentColor,
  timeAgo,
}: {
  postTitle: string;
  commentBody: string;
  subjectName: string;
  accentColor: string;
  timeAgo: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            color: accentColor,
            backgroundColor: `${accentColor}18`,
          }}
        >
          {subjectName}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {timeAgo}
        </span>
      </div>
      <p className="line-clamp-1 text-xs text-muted-foreground">{postTitle}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground italic">
        &quot;{commentBody}&quot;
      </p>
    </div>
  );
}

export function FeedSearchCard({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <SidebarPanel title={labels.feed.searchTitle} icon={Search} className={className}>
      <div className="relative">
        <Input
          placeholder={labels.feed.searchPlaceholder}
          className="rounded-xl border-white/10 bg-white/5 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </SidebarPanel>
  );
}

export function ScrollToTopFab({
  ariaLabel,
  visible = true,
  className,
}: {
  ariaLabel: string;
  visible?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "fixed right-5 bottom-24 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all md:bottom-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        className,
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

export function FeedSidebarUnanswered({
  labels = legacyLabelsFr,
}: {
  labels?: LegacyLabels;
}) {
  const subject = legacySubjects[1];

  return (
    <SidebarPanel
      title={labels.feed.unansweredTitle}
      icon={CircleHelp}
      count={2}
    >
      <div className="flex flex-col gap-3">
        <UnansweredListItem
          title="Problème avec React useEffect et boucle infinie"
          authorName="Camille R."
          authorInitials="CR"
          subjectName={subject.name}
          accentColor={subject.accentColor}
          timeAgo="2 h"
        />
        <UnansweredListItem
          title="Comprendre les closures en JavaScript"
          authorName="Théo N."
          authorInitials="TN"
          subjectName={subject.name}
          accentColor={subject.accentColor}
          timeAgo="5 h"
        />
      </div>
    </SidebarPanel>
  );
}

export function FeedSidebarRecentEmpty({
  labels = legacyLabelsFr,
}: {
  labels?: LegacyLabels;
}) {
  return (
    <SidebarPanel title={labels.feed.recentTitle} icon={History}>
      <SidebarEmptyState message={labels.feed.recentEmpty} />
    </SidebarPanel>
  );
}

export function FeedSidebarContributions({
  labels = legacyLabelsFr,
}: {
  labels?: LegacyLabels;
}) {
  const subject = legacySubjects[1];

  return (
    <SidebarPanel title={labels.feed.contributionsTitle} icon={MessageCircle}>
      <ContributionListItem
        postTitle="Problème avec React useEffect et boucle infinie"
        commentBody="Essaie de retirer data des deps ou de mémoriser fetchData."
        subjectName={subject.name}
        accentColor={subject.accentColor}
        timeAgo="1 h"
      />
    </SidebarPanel>
  );
}
