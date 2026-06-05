"use client";

import { useEffect, useId, useState } from "react";
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
import { PostCardBody, PostCardCodeBlock } from "./post-card";
import {
  FEED_COMMENT_ITEM_CLASS,
  FEED_COMMENT_ITEM_NEW_CLASS,
  FEED_POST_THREAD_INNER_CLASS,
  FEED_POST_THREAD_PANEL_CLASS,
  FEED_POST_THREAD_PANEL_OPEN_CLASS,
  FEED_REPLY_FOOTER_CLASS,
  FEED_POST_GLASS_CARD_CLASS,
  FEED_STAGE_GLASS_CARD_CLASS,
} from "./landing-layout";
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
          <span className="feed-post-meta ml-2 text-xs text-muted-foreground">
          {timeAgo}
        </span>
        </p>
        <p className="feed-post-readable mt-1 text-sm text-muted-foreground">{body}</p>
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
    <div
      className={cn(
        FEED_STAGE_GLASS_CARD_CLASS,
        "w-full min-w-0 rounded-2xl p-6",
        className,
      )}
    >
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
  defaultThreadOpen = false,
  onPostEngage,
}: {
  fixture: PostCardFixture;
  postLabels: PostCardLabels;
  labels: LegacyLabels;
  initialComments: LegacyFeedComment[];
  subjectAccentColor?: string;
  /** Storybook / demo — start with thread and reply bar visible. */
  defaultThreadOpen?: boolean;
  onPostEngage?: () => void;
}) {
  const threadPanelId = useId();
  const [threadOpen, setThreadOpen] = useState(defaultThreadOpen);
  const [comments, setComments] = useState(initialComments);
  const [newCommentId, setNewCommentId] = useState<string | null>(null);

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
    setComments((current) => {
      const id = `local-${current.length + 1}`;
      setNewCommentId(id);
      return [
        ...current,
        {
          id,
          authorName: isEn ? "You" : "Vous",
          authorInitials: isEn ? "YO" : "VO",
          timeAgo: isEn ? "just now" : "à l'instant",
          body,
        },
      ];
    });
    setThreadOpen(true);
    onPostEngage?.();
  };

  return (
    <article
      className={cn(
        FEED_POST_GLASS_CARD_CLASS,
        "w-full rounded-2xl text-left shadow-sm",
      )}
    >
      <PostCardBody
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
        urgent={fixture.urgent}
        code={fixture.code}
        likesCount={fixture.likesCount ?? 0}
        commentsCount={comments.length}
        showActionsMenu
        labels={postLabels}
        repliesExpanded={threadOpen}
        repliesPanelId={threadPanelId}
        onRepliesClick={toggleThread}
        onTitleClick={() => {
          onPostEngage?.();
          legacyDemoToast(fixture.title);
        }}
        onHashtagClick={(tag) => legacyDemoToast(`#${tag}`)}
        onSubjectClick={() => legacyDemoToast(fixture.subjectName)}
      />

      <div
        id={threadPanelId}
        role="region"
        aria-label={postLabels.replies(comments.length)}
        aria-hidden={!threadOpen}
        className={cn(
          FEED_POST_THREAD_PANEL_CLASS,
          threadOpen && FEED_POST_THREAD_PANEL_OPEN_CLASS,
        )}
      >
        <div
          className={cn(
            FEED_POST_THREAD_INNER_CLASS,
            "space-y-5 px-6 pb-0 pt-5",
          )}
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                FEED_COMMENT_ITEM_CLASS,
                comment.id === newCommentId && FEED_COMMENT_ITEM_NEW_CLASS,
              )}
            >
              <CommentCard
                authorName={comment.authorName}
                authorInitials={comment.authorInitials}
                timeAgo={comment.timeAgo}
                body={comment.body}
                code={comment.code}
              />
            </div>
          ))}
        </div>
      </div>

      {threadOpen ? (
        <footer
          className={cn(
            FEED_REPLY_FOOTER_CLASS,
            "px-6 py-4",
          )}
        >
          <QuickReply
            placeholder={labels.feed.quickReplyPlaceholder}
            submitLabel={labels.feed.quickReplySubmit}
            userInitials="AA"
            onSubmit={handleReply}
          />
        </footer>
      ) : null}
    </article>
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
    {
      id: "unanswered-3",
      title: "Différence entre useMemo et useCallback ?",
      authorName: "Léa M.",
      authorInitials: "LM",
      timeAgo: "8 h",
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

  const contributions = [
    {
      id: "contrib-1",
      postTitle: "Problème avec React useEffect et boucle infinie",
      commentBody: "Essaie de retirer data des deps ou de mémoriser fetchData.",
      timeAgo: "1 h",
    },
    {
      id: "contrib-2",
      postTitle: "Comprendre les closures en JavaScript",
      commentBody: "La closure garde la référence de count au moment de la création.",
      timeAgo: "3 h",
    },
    {
      id: "contrib-3",
      postTitle: "Différence entre useMemo et useCallback ?",
      commentBody: "useMemo mémorise une valeur, useCallback mémorise une fonction.",
      timeAgo: "6 h",
    },
  ];

  return (
    <SidebarPanel title={labels.feed.contributionsTitle} icon={MessageCircle}>
      <div className="flex flex-col gap-3">
        {contributions.map((item) => (
          <ContributionListItem
            key={item.id}
            postTitle={item.postTitle}
            commentBody={item.commentBody}
            subjectName={subject.name}
            accentColor={subject.accentColor}
            timeAgo={item.timeAgo}
          />
        ))}
      </div>
    </SidebarPanel>
  );
}
