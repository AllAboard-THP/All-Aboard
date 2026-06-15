"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { cn } from "@allaboard/ui/lib/utils";
import { Link } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  fetchMyBookmarks,
  toggleBookmark,
  toggleLike,
} from "@/lib/social-client";

const MY_BOOKMARKS_QUERY_KEY = ["my-bookmarks"] as const;

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

type Props = {
  helpRequestId: string;
  initialLikesCount?: number;
  /** Skip bookmark prefetch when the list is already bookmarked (e.g. /me/bookmarks). */
  defaultBookmarked?: boolean;
  loginReturnPath: string;
  className?: string;
};

export function PostSocialActions({
  helpRequestId,
  initialLikesCount = 0,
  defaultBookmarked,
  loginReturnPath,
  className,
}: Props) {
  const t = useTranslations("social");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean | null>(
    defaultBookmarked ?? null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isAuthenticated = Boolean(authQuery.data);
  const loginHref = `/login?returnTo=${encodeURIComponent(loginReturnPath)}`;

  const bookmarksQuery = useQuery({
    queryKey: MY_BOOKMARKS_QUERY_KEY,
    queryFn: fetchMyBookmarks,
    enabled: isAuthenticated && defaultBookmarked === undefined,
    staleTime: 30_000,
  });

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  useEffect(() => {
    if (defaultBookmarked !== undefined) {
      setBookmarked(defaultBookmarked);
      return;
    }
    if (!bookmarksQuery.data) return;
    const ids = new Set(bookmarksQuery.data.items.map((item) => item.id));
    setBookmarked(ids.has(helpRequestId));
  }, [bookmarksQuery.data, defaultBookmarked, helpRequestId]);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(helpRequestId),
    onMutate: () => setActionError(null),
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    },
    onError: (error) => {
      setActionError(formatActionError(error, tErrors));
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(helpRequestId),
    onMutate: () => setActionError(null),
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
      void queryClient.invalidateQueries({ queryKey: MY_BOOKMARKS_QUERY_KEY });
    },
    onError: (error) => {
      setActionError(formatActionError(error, tErrors));
    },
  });

  const pending = likeMutation.isPending || bookmarkMutation.isPending;

  if (!isAuthenticated && !authQuery.isPending) {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-2", className)}
        data-testid="post-social-login-hint"
      >
        <p className="m-0 text-xs text-muted-foreground">
          {t.rich("loginHint", {
            link: () => (
              <Link href={loginHref} className="text-primary underline">
                {t("loginLink")}
              </Link>
            ),
          })}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      data-testid="post-social-actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending || authQuery.isPending}
          aria-pressed={liked === true}
          aria-label={t("likeAria", { count: likesCount })}
          data-testid="post-like-button"
          className={cn(
            "h-8 px-2 text-xs",
            liked === true && "text-destructive hover:text-destructive",
          )}
          onClick={() => likeMutation.mutate()}
        >
          {t("likeLabel", { count: likesCount })}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending || authQuery.isPending}
          aria-pressed={bookmarked === true}
          aria-label={
            bookmarked
              ? t("bookmarkRemoveAria")
              : t("bookmarkAddAria")
          }
          data-testid="post-bookmark-button"
          className={cn(
            "h-8 px-2 text-xs",
            bookmarked === true && "text-primary hover:text-primary",
          )}
          onClick={() => bookmarkMutation.mutate()}
        >
          {bookmarked ? t("bookmarkedLabel") : t("bookmarkLabel")}
        </Button>
      </div>
      {actionError ? (
        <p className="m-0 text-xs text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}

function formatActionError(
  error: unknown,
  tErrors: (key: string) => string,
): string {
  if (error instanceof ApiRequestError) {
    return tErrors(
      mapApiError({
        status: error.status,
        body: { error: error.code },
      }),
    );
  }
  return tErrors("unknown");
}
