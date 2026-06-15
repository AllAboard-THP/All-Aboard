export const FEED_DEFAULT_LIMIT = 15;

export type FeedPageParams = {
  subject?: string;
  tag?: string;
  q?: string;
  page: number;
  limit: number;
};

export function parseFeedPageSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): FeedPageParams {
  const pick = (key: string): string | undefined => {
    const value = searchParams[key];
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  };

  const pageRaw = pick("page");
  const limitRaw = pick("limit");
  const page = pageRaw
    ? Math.max(1, Number.parseInt(pageRaw, 10) || 1)
    : 1;
  const limit = limitRaw
    ? Math.min(
        100,
        Math.max(1, Number.parseInt(limitRaw, 10) || FEED_DEFAULT_LIMIT),
      )
    : FEED_DEFAULT_LIMIT;

  return {
    subject: pick("subject")?.toLowerCase(),
    tag: pick("tag")?.toLowerCase(),
    q: pick("q"),
    page,
    limit,
  };
}

export function buildFeedQueryString(
  params: FeedPageParams,
  options?: { includeWidgets?: boolean },
): string {
  const searchParams = new URLSearchParams();
  if (params.subject) searchParams.set("subject", params.subject);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.q) searchParams.set("q", params.q);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit !== FEED_DEFAULT_LIMIT) {
    searchParams.set("limit", String(params.limit));
  }
  if (options?.includeWidgets) {
    searchParams.set("include", "widgets");
  }
  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
}

/** Path + query for next-intl `Link` (locale prefix added by router). */
export function feedHref(
  params: FeedPageParams,
  options?: { includeWidgets?: boolean },
): string {
  const query = buildFeedQueryString(params, options);
  return query.length > 0 ? `/${query}` : "/";
}

export function feedPageHref(
  current: FeedPageParams,
  page: number,
): string {
  return feedHref({ ...current, page });
}
