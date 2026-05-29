"use client";

import { useEffect, useState } from "react";
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
import type { LegacyFeedComment, LegacyRecentlyViewedPost } from "./fixtures/legacy-feed-thread";
import type { PostCardFixture, PostCardLabels } from "../i18n/post-card-labels";
import { PostCard, PostCardCodeBlock } from "./post-card";
import { legacyDemoToast } from "./legacy-story-feedback";

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
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  userInitials?: string;
  className?: string;
  onSubmit?: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    legacyDemoToast(submitLabel);
    setValue("");
  };

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 gap-2">
        <Input
          placeholder={placeholder}
          className="rounded-xl border-white/10 bg-black/30"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <Button
          className="shrink-0 rounded-xl"
          disabled={!value.trim()}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
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
  onClick,
}: {
  title: string;
  authorName: string;
  authorInitials: string;
  subjectName: string;
  accentColor: string;
  timeAgo: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full rounded-xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
      onClick={() => {
        onClick?.();
        if (!onClick) {
          legacyDemoToast(title);
        }
      }}
    >
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
    </button>
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
    <button
      type="button"
      className="w-full rounded-xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
      onClick={() => legacyDemoToast(postTitle)}
    >
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
    </button>
  );
}

export function FeedSearchCard({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  return (
    <SidebarPanel title={labels.feed.searchTitle} icon={Search} className={className}>
      <div className="relative">
        <Input
          placeholder={labels.feed.searchPlaceholder}
          className="rounded-xl border-white/10 bg-white/5 pr-10"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && query.trim()) {
              legacyDemoToast(labels.feed.searchTitle);
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          onClick={() => {
            if (query.trim()) {
              legacyDemoToast(labels.feed.searchTitle);
            }
          }}
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
  trackScroll = false,
  scrollThreshold = 320,
  className,
}: {
  ariaLabel: string;
  visible?: boolean;
  trackScroll?: boolean;
  scrollThreshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (!trackScroll) {
      setIsVisible(visible);
      return;
    }

    const onScroll = () => {
      setIsVisible(window.scrollY > scrollThreshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [trackScroll, scrollThreshold, visible]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "fixed right-5 bottom-24 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all md:bottom-8",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
        className,
      )}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        legacyDemoToast(ariaLabel);
      }}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

const javascriptSubjectIcon = (
  <span className="inline-block size-2.5 rounded-sm bg-yellow-400" aria-hidden />
);

export function FeedPostWithThread({
  fixture,
  postLabels,
  labels,
  initialComments,
  subjectAccentColor = "#EAB308",
  onPostEngage,
}: {
  fixture: PostCardFixture;
  postLabels: PostCardLabels;
  labels: LegacyLabels;
  initialComments: LegacyFeedComment[];
  subjectAccentColor?: string;
  onPostEngage?: () => void;
}) {
  const [threadOpen, setThreadOpen] = useState(false);
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const toggleThread = () => {
    setThreadOpen((open) => {
      const next = !open;
      if (next) {
        onPostEngage?.();
      }
      return next;
    });
  };

  const handleReply = (body: string) => {
    const isEn = labels.nav.feed === "Home";
    setComments((current) => [
      ...current,
      {
        id: `local-${current.length + 1}`,
        authorName: isEn ? "You" : "Vous",
        authorInitials: isEn ? "YO" : "VO",
        timeAgo: isEn ? "just now" : "à l'instant",
        body,
      },
    ]);
    setThreadOpen(true);
    onPostEngage?.();
  };

  return (
    <div className="space-y-6">
      <PostCard
        authorName={fixture.authorName}
        authorInitials={fixture.authorInitials}
        postedAt={fixture.postedAt}
        educationLevel={fixture.educationLevel}
        title={fixture.title}
        body={fixture.body}
        subject={{
          name: fixture.subjectName,
          accentColor: subjectAccentColor,
          icon: javascriptSubjectIcon,
        }}
        hashtags={fixture.hashtags}
        urgent
        code={{
          language: "javascript",
          snippet: `useEffect(() => {
  fetchData();
}, [data]); ${fixture.codeComment}`,
        }}
        likesCount={3}
        commentsCount={comments.length}
        showActionsMenu
        labels={postLabels}
        repliesExpanded={threadOpen}
        onRepliesClick={toggleThread}
        onTitleClick={() => {
          onPostEngage?.();
          legacyDemoToast(fixture.title);
        }}
        onHashtagClick={(tag) => legacyDemoToast(`#${tag}`)}
        onSubjectClick={() => legacyDemoToast(fixture.subjectName)}
      />

      {threadOpen ? (
        <section className="glass space-y-5 rounded-2xl p-6">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              authorName={comment.authorName}
              authorInitials={comment.authorInitials}
              timeAgo={comment.timeAgo}
              body={comment.body}
              code={comment.code}
            />
          ))}
        </section>
      ) : null}

      <QuickReply
        placeholder={labels.feed.quickReplyPlaceholder}
        submitLabel={labels.feed.quickReplySubmit}
        userInitials="AA"
        onSubmit={handleReply}
      />
    </div>
  );
}

export function FeedSidebarUnanswered({
  labels = legacyLabelsFr,
  onItemClick,
  className,
}: {
  labels?: LegacyLabels;
  onItemClick?: (item: {
    id: string;
    title: string;
    subjectName: string;
    accentColor: string;
  }) => void;
  className?: string;
}) {
  const subject = legacySubjects[1];
  const items = [
    {
      id: "unanswered-1",
      title: "Problème avec React useEffect et boucle infinie",
      authorName: "Camille R.",
      authorInitials: "CR",
      timeAgo: "2 h",
    },
    {
      id: "unanswered-2",
      title: "Comprendre les closures en JavaScript",
      authorName: "Théo N.",
      authorInitials: "TN",
      timeAgo: "5 h",
    },
  ];

  return (
    <SidebarPanel
      title={labels.feed.unansweredTitle}
      icon={CircleHelp}
      count={items.length}
      className={className}
    >
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <UnansweredListItem
            key={item.id}
            title={item.title}
            authorName={item.authorName}
            authorInitials={item.authorInitials}
            subjectName={subject.name}
            accentColor={subject.accentColor}
            timeAgo={item.timeAgo}
            onClick={() =>
              onItemClick?.({
                id: item.id,
                title: item.title,
                subjectName: subject.name,
                accentColor: subject.accentColor,
              })
            }
          />
        ))}
      </div>
    </SidebarPanel>
  );
}

export function FeedSidebarRecentEmpty({
  labels = legacyLabelsFr,
  className,
}: {
  labels?: LegacyLabels;
  className?: string;
}) {
  return (
    <SidebarPanel title={labels.feed.recentTitle} icon={History} className={className}>
      <SidebarEmptyState message={labels.feed.recentEmpty} />
    </SidebarPanel>
  );
}

export function FeedSidebarRecentViewed({
  items,
  labels = legacyLabelsFr,
  onItemClick,
  className,
}: {
  items: LegacyRecentlyViewedPost[];
  labels?: LegacyLabels;
  onItemClick?: (id: string) => void;
  className?: string;
}) {
  if (items.length === 0) {
    return <FeedSidebarRecentEmpty labels={labels} className={className} />;
  }

  return (
    <SidebarPanel title={labels.feed.recentTitle} icon={History} className={className}>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="w-full rounded-xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
            onClick={() => onItemClick?.(item.id)}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  color: item.accentColor,
                  backgroundColor: `${item.accentColor}18`,
                }}
              >
                {item.subjectName}
              </span>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {item.timeAgo}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-gray-300">{item.title}</p>
          </button>
        ))}
      </div>
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
