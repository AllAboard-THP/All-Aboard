import type { PublicUserTab } from "@allaboard/types";

export const PUBLIC_USER_DEFAULT_LIMIT = 10;

export type PublicUserPageParams = {
  tab: PublicUserTab;
  page: number;
  limit: number;
};

export function parsePublicUserSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): PublicUserPageParams {
  const pick = (key: string): string | undefined => {
    const value = searchParams[key];
    return typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined;
  };

  const tabRaw = pick("tab")?.toLowerCase();
  const tab: PublicUserTab = tabRaw === "responses" ? "responses" : "posts";
  const pageRaw = pick("page");
  const limitRaw = pick("limit");
  const page = pageRaw
    ? Math.max(1, Number.parseInt(pageRaw, 10) || 1)
    : 1;
  const limit = limitRaw
    ? Math.min(
        50,
        Math.max(1, Number.parseInt(limitRaw, 10) || PUBLIC_USER_DEFAULT_LIMIT),
      )
    : PUBLIC_USER_DEFAULT_LIMIT;

  return { tab, page, limit };
}

export function buildPublicUserQueryString(params: PublicUserPageParams): string {
  const searchParams = new URLSearchParams();
  if (params.tab !== "posts") searchParams.set("tab", params.tab);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit !== PUBLIC_USER_DEFAULT_LIMIT) {
    searchParams.set("limit", String(params.limit));
  }
  const qs = searchParams.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

export function publicUserHref(
  userId: string,
  params: PublicUserPageParams,
): string {
  return `/users/${encodeURIComponent(userId)}${buildPublicUserQueryString(params)}`;
}
