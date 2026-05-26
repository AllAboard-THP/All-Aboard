import type {
  AuthMeResponse,
  FeedResponse,
  HelpRequest,
  HelpRequestDetailResponse,
  MentorFeedResponse,
} from "@allaboard/types";

const DEFAULT_API_URL = "http://127.0.0.1:4000";

export function getApiBaseUrl(): string {
  const raw = process.env.API_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_API_URL;
}

function isHelpRequest(value: unknown): value is HelpRequest {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const tagsOk =
    o.tags === undefined ||
    o.tags === null ||
    (Array.isArray(o.tags) && o.tags.every((x) => typeof x === "string"));
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.authorId === "string" &&
    typeof o.createdAt === "string" &&
    tagsOk
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

export function parseHelpRequestDetailResponse(
  data: unknown,
): HelpRequestDetailResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid detail: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!isHelpRequest(o.item)) {
    throw new Error("Invalid detail: item shape");
  }
  if (o.responses !== undefined) {
    if (!Array.isArray(o.responses)) {
      throw new Error("Invalid detail: responses must be an array");
    }
  }
  return {
    item: o.item,
    ...(Array.isArray(o.responses) ? { responses: o.responses } : {}),
  };
}

export function parseMentorFeedResponse(data: unknown): MentorFeedResponse {
  return parseFeedResponse(data);
}

export function parseAuthMeResponse(data: unknown): AuthMeResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid auth/me: expected object");
  }
  const o = data as Record<string, unknown>;
  if (typeof o.userId !== "string") {
    throw new Error("Invalid auth/me: userId");
  }
  if (o.role !== "student" && o.role !== "mentor") {
    throw new Error("Invalid auth/me: role");
  }
  return { userId: o.userId, role: o.role };
}

export type FetchFeedResult =
  | { ok: true; data: FeedResponse }
  | { ok: false; error: string };

export type FetchHelpRequestResult =
  | { ok: true; data: HelpRequestDetailResponse }
  | { ok: false; error: string; status?: number };

export type FetchMentorFeedResult =
  | { ok: true; data: MentorFeedResponse }
  | { ok: false; error: string };

export type FetchAuthMeResult =
  | { ok: true; data: AuthMeResponse }
  | { ok: false; error: string; status?: number };

async function fetchJson(url: string, init?: RequestInit): Promise<{
  ok: boolean;
  status: number;
  json: unknown;
  text: string;
}> {
  const res = await fetch(url, init);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text.length > 0 ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json, text };
}

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

export async function fetchHelpRequest(
  id: string,
): Promise<FetchHelpRequestResult> {
  const url = `${getApiBaseUrl()}/help-requests/${encodeURIComponent(id)}`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      next: { revalidate: 60 },
    });
    if (status === 404) {
      return { ok: false, error: "not_found", status: 404 };
    }
    if (!ok) {
      const err =
        typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error: unknown }).error === "string"
          ? (json as { error: string }).error
          : `Detail HTTP ${status}`;
      return { ok: false, error: err, status };
    }
    try {
      return { ok: true, data: parseHelpRequestDetailResponse(json) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid detail payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchMentorFeed(): Promise<FetchMentorFeedResult> {
  const url = `${getApiBaseUrl()}/mentor/feed`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      next: { revalidate: 60 },
    });
    if (!ok) {
      return { ok: false, error: `Mentor feed HTTP ${status}` };
    }
    try {
      return { ok: true, data: parseMentorFeedResponse(json) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid mentor feed";
      return { ok: false, error: message };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchAuthMe(
  accessToken: string,
): Promise<FetchAuthMeResult> {
  const url = `${getApiBaseUrl()}/auth/me`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized", status: 401 };
    }
    if (!ok) {
      return { ok: false, error: `Auth HTTP ${status}`, status };
    }
    try {
      return { ok: true, data: parseAuthMeResponse(json) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid auth/me";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
