import type { FeedResponse, HelpRequest } from "@allaboard/types";

const DEFAULT_API_URL = "http://127.0.0.1:4000";

export function getApiBaseUrl(): string {
  const raw = process.env.API_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_API_URL;
}

function isHelpRequest(value: unknown): value is HelpRequest {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.authorId === "string" &&
    typeof o.createdAt === "string"
  );
}

export function parseFeedResponse(data: unknown): FeedResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid feed: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid feed: items must be an array");
  }
  if (!o.items.every(isHelpRequest)) {
    throw new Error("Invalid feed: item shape");
  }
  return { items: o.items };
}

export type FetchFeedResult =
  | { ok: true; data: FeedResponse }
  | { ok: false; error: string };

export async function fetchFeed(): Promise<FetchFeedResult> {
  const url = `${getApiBaseUrl()}/feed`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return {
        ok: false,
        error: `Feed HTTP ${res.status}`,
      };
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return { ok: false, error: "Feed response is not JSON" };
    }
    try {
      return { ok: true, data: parseFeedResponse(json) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid feed payload";
      return { ok: false, error: message };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
