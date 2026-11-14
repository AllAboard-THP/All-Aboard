import type { HelpRequest } from "@allaboard/types";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { PostSocialActions } from "@/components/features/post-social-actions";
import { Link } from "@/i18n/navigation";
import {
  feedHref,
  FEED_DEFAULT_LIMIT,
} from "@/lib/feed-search-params";

export type PostCardLabels = {
  author: (authorId: string) => string;
  formatDate: (iso: string) => string;
  responsesCount: (count: number) => string;
  likesCount: (count: number) => string;
  urgent: string;
  resolved: string;
  filterByTagAria: (tag: string) => string;
};

type Props = {
  item: HelpRequest;
  labels: PostCardLabels;
  /** Shorter layout for sidebar widgets. */
  compact?: boolean;
  /** Like / bookmark controls (feed, detail, personal lists). */
  showSocialActions?: boolean;
  socialLoginReturnPath?: string;
  defaultBookmarked?: boolean;
};

function excerpt(body: string | undefined, maxLength: number): string | null {
  if (!body?.trim()) return null;
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

export function PostCard({
  item,
  labels,
  compact = false,
  showSocialActions = false,
  socialLoginReturnPath,
  defaultBookmarked,
}: Props) {
  const bodyPreview = compact ? null : excerpt(item.body, 220);
  const hasTags = Boolean(item.tags && item.tags.length > 0);
  const showStats =
    item.responsesCount !== undefined || item.likesCount !== undefined;

  return (
    <Card
      className="w-full gap-0 py-4 transition-colors hover:border-primary/50"
      data-testid={compact ? "post-card-compact" : "post-card"}
    >
      <CardHeader className={`gap-1.5 px-4 ${bodyPreview || hasTags ? "pb-2" : "pb-0"}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">
            <Link
              href={`/requests/${item.id}`}
              className="text-foreground hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {item.urgent ? (
              <Badge variant="destructive">{labels.urgent}</Badge>
            ) : null}
            {item.status === "resolved" ? (
              <Badge variant="secondary">{labels.resolved}</Badge>
            ) : null}
          </div>
        </div>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          <span>{labels.author(item.authorId)}</span>
          <span>{labels.formatDate(item.createdAt)}</span>
        </CardDescription>
      </CardHeader>

      {(item.subject || hasTags || bodyPreview || showStats || showSocialActions) && (
        <CardContent className="flex flex-col gap-3 px-4 pt-0">
          {(item.subject || hasTags) && (
            <div className="flex flex-wrap items-center gap-2">
              {item.subject ? (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: `${item.subject.accentColor}66`,
                    color: item.subject.accentColor,
                  }}
                >
                  {item.subject.name}
                </Badge>
              ) : null}
              {item.tags?.map((tag) => (
                <Link
                  key={tag}
                  href={feedHref({
                    page: 1,
                    limit: FEED_DEFAULT_LIMIT,
                    tag,
                  })}
                  aria-label={labels.filterByTagAria(tag)}
                >
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {bodyPreview ? (
            <p className="m-0 text-sm leading-relaxed text-muted-foreground">
              {bodyPreview}
            </p>
          ) : null}

          {showStats ? (
            <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {item.responsesCount !== undefined ? (
                <span>{labels.responsesCount(item.responsesCount)}</span>
              ) : null}
              {item.likesCount !== undefined && !showSocialActions ? (
                <span>{labels.likesCount(item.likesCount)}</span>
              ) : null}
            </p>
          ) : null}

          {showSocialActions ? (
            <PostSocialActions
              helpRequestId={item.id}
              initialLikesCount={item.likesCount ?? 0}
              defaultBookmarked={defaultBookmarked}
              loginReturnPath={
                socialLoginReturnPath ?? `/requests/${item.id}`
              }
            />
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
