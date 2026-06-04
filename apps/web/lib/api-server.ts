import type {
  AuthMeResponse,
  FeedResponse,
  HelpRequest,
  HelpRequestDetailResponse,
  MentorFeedItem,
  MentorFeedResponse,
  Response,
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

function isResponse(value: unknown): value is Response {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.helpRequestId === "string" &&
    typeof o.body === "string" &&
    typeof o.authorId === "string"
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
  const result: FeedResponse = { items: o.items };
  if (o.pagination !== undefined) {
    if (typeof o.pagination !== "object" || o.pagination === null) {
      throw new Error("Invalid feed: pagination shape");
    }
    const p = o.pagination as Record<string, unknown>;
    if (
      typeof p.page !== "number" ||
      typeof p.limit !== "number" ||
      typeof p.total !== "number"
    ) {
      throw new Error("Invalid feed: pagination shape");
    }
    result.pagination = {
      page: p.page,
      limit: p.limit,
      total: p.total,
    };
  }
  if (o.widgets !== undefined) {
    if (typeof o.widgets !== "object" || o.widgets === null) {
      throw new Error("Invalid feed: widgets shape");
    }
    const w = o.widgets as Record<string, unknown>;
    if (w.unanswered !== undefined) {
      if (
        !Array.isArray(w.unanswered) ||
        !w.unanswered.every(isHelpRequest)
      ) {
        throw new Error("Invalid feed: widgets.unanswered shape");
      }
      result.widgets = { unanswered: w.unanswered };
    }
  }
  return result;
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
    if (!o.responses.every(isResponse)) {
      throw new Error("Invalid detail: response shape");
    }
  }
  let certificationFilter: HelpRequestDetailResponse["certificationFilter"];
  if (o.certificationFilter !== undefined) {
    if (typeof o.certificationFilter !== "object" || o.certificationFilter === null) {
      throw new Error("Invalid detail: certificationFilter shape");
    }
    const cf = o.certificationFilter as Record<string, unknown>;
    if (
      cf.applied !== true ||
      typeof cf.totalCount !== "number" ||
      typeof cf.visibleCount !== "number"
    ) {
      throw new Error("Invalid detail: certificationFilter shape");
    }
    certificationFilter = {
      applied: true,
      totalCount: cf.totalCount,
      visibleCount: cf.visibleCount,
    };
  }
  return {
    item: o.item,
    ...(Array.isArray(o.responses) ? { responses: o.responses } : {}),
    ...(certificationFilter ? { certificationFilter } : {}),
  };
}

function isMentorFeedItem(value: unknown): value is MentorFeedItem {
  if (!isHelpRequest(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.responseCount === "number" &&
    Number.isInteger(o.responseCount) &&
    o.responseCount >= 0 &&
    (o.lastResponseAt === null || typeof o.lastResponseAt === "string") &&
    typeof o.hasUnreadForMentor === "boolean"
  );
}

export function parseMentorFeedResponse(data: unknown): MentorFeedResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid mentor feed: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid mentor feed: items must be an array");
  }
  if (!o.items.every(isMentorFeedItem)) {
    throw new Error("Invalid mentor feed: item shape");
  }
  return { items: o.items };
}

export function parseAuthMeResponse(data: unknown): AuthMeResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid auth/me: expected object");
  }
  const o = data as Record<string, unknown>;
  if (typeof o.userId !== "string") {
    throw new Error("Invalid auth/me: userId");
  }
  if (o.role !== "student" && o.role !== "mentor" && o.role !== "admin") {
    throw new Error("Invalid auth/me: role");
  }
  const result: AuthMeResponse = { userId: o.userId, role: o.role };
  if (typeof o.displayName === "string") result.displayName = o.displayName;
  if (typeof o.fullName === "string") result.fullName = o.fullName;
  if (typeof o.headline === "string") result.headline = o.headline;
  if (typeof o.bio === "string") result.bio = o.bio;
  if (typeof o.avatarUrl === "string") result.avatarUrl = o.avatarUrl;
  if (typeof o.educationLevel === "string") {
    result.educationLevel = o.educationLevel;
  }
  if (typeof o.cguAcceptedAt === "string") {
    result.cguAcceptedAt = o.cguAcceptedAt;
  }
  if (typeof o.notifyOnComment === "boolean") {
    result.notifyOnComment = o.notifyOnComment;
  }
  if (typeof o.notifyOnMessage === "boolean") {
    result.notifyOnMessage = o.notifyOnMessage;
  }
  if (
    Array.isArray(o.certificationTags) &&
    o.certificationTags.every((t) => typeof t === "string")
  ) {
    result.certificationTags = o.certificationTags;
  }
  if (Array.isArray(o.competenceSubjects)) {
    result.competenceSubjects = o.competenceSubjects as AuthMeResponse["competenceSubjects"];
  }
  return result;
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

export async function fetchMentorFeed(
  accessToken: string,
): Promise<FetchMentorFeedResult> {
  const url = `${getApiBaseUrl()}/mentor/feed`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized" };
    }
    if (status === 403) {
      return { ok: false, error: "forbidden" };
    }
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
