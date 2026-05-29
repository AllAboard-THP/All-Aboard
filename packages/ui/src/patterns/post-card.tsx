"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Bookmark,
  Copy,
  Ellipsis,
  Heart,
  Lock,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Button } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import {
  postCardLabelsFr,
  type PostCardLabels,
} from "../i18n/post-card-labels";
import { cn } from "@allaboard/ui/lib/utils";
import { legacyDemoToast } from "./legacy-story-feedback";

export type { PostCardLabels } from "../i18n/post-card-labels";

export type PostCardSubjectTag = {
  name: string;
  accentColor: string;
  icon?: ReactNode;
};

export type PostCardCodeBlock = {
  language: string;
  snippet: string;
};

export type PostCardProps = {
  authorName: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  postedAt: string;
  educationLevel: string;
  title: string;
  body: string;
  subject: PostCardSubjectTag;
  hashtags?: string[];
  urgent?: boolean;
  code?: PostCardCodeBlock;
  likesCount?: number;
  commentsCount?: number;
  liked?: boolean;
  bookmarked?: boolean;
  showActionsMenu?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  showPrivateMessage?: boolean;
  labels?: PostCardLabels;
  className?: string;
  repliesExpanded?: boolean;
  onRepliesClick?: () => void;
  onTitleClick?: () => void;
  onHashtagClick?: (tag: string) => void;
  onSubjectClick?: () => void;
};

function SubjectTag({ subject }: { subject: PostCardSubjectTag }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        color: subject.accentColor,
        borderColor: `${subject.accentColor}33`,
        backgroundColor: `${subject.accentColor}18`,
      }}
    >
      {subject.icon}
      {subject.name}
    </span>
  );
}

export function PostCardCodeBlock({
  language,
  snippet,
  copyLabel = postCardLabelsFr.copy,
  className,
}: PostCardCodeBlock & { copyLabel?: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {language}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            void navigator.clipboard.writeText(snippet);
          }}
        >
          <Copy data-icon="inline-start" />
          {copyLabel}
        </Button>
      </div>
      <pre className="m-0 overflow-x-auto bg-black/30 p-4 text-sm leading-relaxed text-foreground">
        <code className="font-mono whitespace-pre">{snippet}</code>
      </pre>
    </div>
  );
}

export function PostCardActionsMenu({
  canEdit = true,
  canDelete = false,
  labels = postCardLabelsFr,
}: {
  canEdit?: boolean;
  canDelete?: boolean;
  labels?: PostCardLabels;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          aria-label={labels.postActionsAria}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass min-w-[150px] rounded-xl">
        {canEdit ? (
          <DropdownMenuItem onSelect={() => legacyDemoToast(labels.edit)}>
            <Pencil data-icon="inline-start" />
            {labels.edit}
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => legacyDemoToast(labels.delete)}
          >
            <Trash2 data-icon="inline-start" />
            {labels.delete}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PostCard({
  authorName,
  authorAvatarUrl,
  authorInitials,
  postedAt,
  educationLevel,
  title,
  body,
  subject,
  hashtags = [],
  urgent = false,
  code,
  likesCount = 0,
  commentsCount = 0,
  liked = false,
  bookmarked = false,
  showActionsMenu = false,
  canEdit = true,
  canDelete = false,
  showPrivateMessage = true,
  labels = postCardLabelsFr,
  className,
  repliesExpanded = false,
  onRepliesClick,
  onTitleClick,
  onHashtagClick,
  onSubjectClick,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [likes, setLikes] = useState(likesCount);

  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  useEffect(() => {
    setIsBookmarked(bookmarked);
  }, [bookmarked]);

  useEffect(() => {
    setLikes(likesCount);
  }, [likesCount]);

  const initials =
    authorInitials ??
    authorName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <article
      className={cn("glass w-full max-w-2xl rounded-2xl text-left shadow-sm", className)}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border-2 border-primary/30">
              {authorAvatarUrl ? (
                <AvatarImage src={authorAvatarUrl} alt={authorName} />
              ) : null}
              <AvatarFallback className="bg-muted text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {postedAt} • {educationLevel}
              </span>
            </div>
          </div>
          {showActionsMenu ? (
            <PostCardActionsMenu
              canEdit={canEdit}
              canDelete={canDelete}
              labels={labels}
            />
          ) : null}
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {onTitleClick ? (
            <button
              type="button"
              className="text-left transition-colors hover:text-primary"
              onClick={onTitleClick}
            >
              {title}
            </button>
          ) : (
            title
          )}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{body}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {onSubjectClick ? (
            <button type="button" onClick={onSubjectClick}>
              <SubjectTag subject={subject} />
            </button>
          ) : (
            <SubjectTag subject={subject} />
          )}
          {hashtags.length > 0 ? (
            <span className="select-none text-xs text-white/15">·</span>
          ) : null}
          {hashtags.map((tag) =>
            onHashtagClick ? (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                onClick={() => onHashtagClick(tag)}
              >
                #{tag}
              </button>
            ) : (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ),
          )}
          {urgent ? (
            <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-xs font-medium text-orange-400">
              🔥 {labels.urgent}
            </span>
          ) : null}
        </div>

        {code ? (
          <PostCardCodeBlock
            language={code.language}
            snippet={code.snippet}
            copyLabel={labels.copy}
            className="mb-4"
          />
        ) : null}

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                isLiked
                  ? "text-pink-500"
                  : "text-muted-foreground hover:text-pink-500",
              )}
              onClick={() => {
                setIsLiked((current) => {
                  const next = !current;
                  setLikes((count) => count + (next ? 1 : -1));
                  return next;
                });
              }}
            >
              <Heart className={cn("size-5", isLiked && "fill-current")} />
              <span>{likes}</span>
            </button>
            {onRepliesClick ? (
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  repliesExpanded
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
                onClick={onRepliesClick}
              >
                <MessageCircle className="size-5" />
                <span>{labels.replies(commentsCount)}</span>
              </button>
            ) : (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="size-5" />
                <span>{labels.replies(commentsCount)}</span>
              </span>
            )}
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 transition-colors",
                isBookmarked
                  ? "text-blue-400"
                  : "text-muted-foreground hover:text-blue-400",
              )}
              aria-label={labels.bookmarkAria}
              onClick={() => setIsBookmarked((current) => !current)}
            >
              <Bookmark className={cn("size-5", isBookmarked && "fill-current")} />
            </button>
          </div>
          {showPrivateMessage ? (
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground"
              onClick={() => legacyDemoToast(labels.privateMessage)}
            >
              <Lock className="size-3.5" />
              {labels.privateMessage}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
