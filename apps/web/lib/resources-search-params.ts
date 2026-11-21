import { RESOURCES_DEFAULT_LIMIT } from "@/lib/api-server";

export type ResourcesPageParams = {
  q?: string;
  page: number;
  limit: number;
};

export function parseResourcesPageSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ResourcesPageParams {
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
        Math.max(1, Number.parseInt(limitRaw, 10) || RESOURCES_DEFAULT_LIMIT),
      )
    : RESOURCES_DEFAULT_LIMIT;

  return {
    q: pick("q"),
    page,
    limit,
  };
}

export function buildResourcesQueryString(params: ResourcesPageParams): string {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page > 1) searchParams.set("page", String(params.page));
  if (params.limit !== RESOURCES_DEFAULT_LIMIT) {
    searchParams.set("limit", String(params.limit));
  }
  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : "";
}

export function resourcesHref(params: ResourcesPageParams): string {
  const query = buildResourcesQueryString(params);
  return query.length > 0 ? `/resources${query}` : "/resources";
}

export function resourcesPageHref(
  current: ResourcesPageParams,
  page: number,
): string {
  return resourcesHref({ ...current, page });
}
