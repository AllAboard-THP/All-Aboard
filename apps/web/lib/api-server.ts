import type {
  AuthMeResponse,
  ChatMessage,
  ConversationInboxItem,
  ConversationParticipantSummary,
  ConversationsListResponse,
  ConversationSummary,
  CreateConversationResponse,
  CreateMessageResponse,
  FeedResponse,
  HelpRequest,
  HelpRequestDetailResponse,
  MarkConversationReadResponse,
  MentorDashboardResponse,
  MentorFeedItem,
  MentorFeedResponse,
  MessagesListResponse,
  MyHelpRequestsResponse,
  PublicUserResponse,
  Resource,
  ResourceDetailResponse,
  ResourcesListResponse,
  Response,
  Subject,
  SubjectSummary,
  SubjectsResponse,
} from "@allaboard/types";

import {
  buildFeedQueryString,
  FEED_DEFAULT_LIMIT,
  type FeedPageParams,
} from "@/lib/feed-search-params";
import {
  buildPublicUserQueryString,
  PUBLIC_USER_DEFAULT_LIMIT,
  type PublicUserPageParams,
} from "@/lib/user-search-params";

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

function isSubject(value: unknown): value is Subject {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.slug === "string" &&
    typeof o.icon === "string" &&
    typeof o.accentColor === "string" &&
    typeof o.postsCount === "number"
  );
}

export function parseSubjectsResponse(data: unknown): SubjectsResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid subjects: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid subjects: items must be an array");
  }
  if (!o.items.every(isSubject)) {
    throw new Error("Invalid subjects: item shape");
  }
  return { items: o.items };
}

function isSubjectSummary(value: unknown): value is SubjectSummary {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.slug === "string" &&
    typeof o.icon === "string" &&
    typeof o.accentColor === "string"
  );
}

function isResource(value: unknown): value is Resource {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  const statusOk =
    o.status === "pending" ||
    o.status === "published" ||
    o.status === "rejected";
  const tagsOk =
    o.tags === undefined ||
    (Array.isArray(o.tags) && o.tags.every((x) => typeof x === "string"));
  const subjectOk =
    o.subject === undefined ||
    o.subject === null ||
    isSubjectSummary(o.subject);
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    typeof o.body === "string" &&
    typeof o.authorId === "string" &&
    statusOk &&
    typeof o.createdAt === "string" &&
    typeof o.updatedAt === "string" &&
    tagsOk &&
    subjectOk &&
    (o.subjectId === undefined || typeof o.subjectId === "string")
  );
}

export function parseResourcesListResponse(data: unknown): ResourcesListResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid resources list: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid resources list: items must be an array");
  }
  if (!o.items.every(isResource)) {
    throw new Error("Invalid resources list: item shape");
  }
  if (typeof o.pagination !== "object" || o.pagination === null) {
    throw new Error("Invalid resources list: pagination shape");
  }
  const p = o.pagination as Record<string, unknown>;
  if (
    typeof p.page !== "number" ||
    typeof p.limit !== "number" ||
    typeof p.total !== "number"
  ) {
    throw new Error("Invalid resources list: pagination shape");
  }
  return {
    items: o.items,
    pagination: { page: p.page, limit: p.limit, total: p.total },
  };
}

export function parseResourceDetailResponse(
  data: unknown,
): ResourceDetailResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid resource detail: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!isResource(o.item)) {
    throw new Error("Invalid resource detail: item shape");
  }
  return { item: o.item };
}

function isMentorDashboardStats(
  value: unknown,
): value is MentorDashboardResponse["stats"] {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.myResourcesCount === "number" &&
    typeof o.pendingResourcesCount === "number" &&
    typeof o.helpMentorQueueCount === "number"
  );
}

export function parseMentorDashboardResponse(
  data: unknown,
): MentorDashboardResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid mentor dashboard: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!isMentorDashboardStats(o.stats)) {
    throw new Error("Invalid mentor dashboard: stats shape");
  }
  if (!Array.isArray(o.myResources)) {
    throw new Error("Invalid mentor dashboard: myResources must be an array");
  }
  if (!o.myResources.every(isResource)) {
    throw new Error("Invalid mentor dashboard: myResources item shape");
  }
  if (!Array.isArray(o.pendingResources)) {
    throw new Error("Invalid mentor dashboard: pendingResources must be an array");
  }
  if (!o.pendingResources.every(isResource)) {
    throw new Error("Invalid mentor dashboard: pendingResources item shape");
  }
  if (!Array.isArray(o.helpMentorQueue)) {
    throw new Error("Invalid mentor dashboard: helpMentorQueue must be an array");
  }
  if (!o.helpMentorQueue.every(isHelpRequest)) {
    throw new Error("Invalid mentor dashboard: helpMentorQueue item shape");
  }
  return {
    stats: o.stats,
    myResources: o.myResources,
    pendingResources: o.pendingResources,
    helpMentorQueue: o.helpMentorQueue,
  };
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.body === "string" &&
    typeof o.userId === "string" &&
    typeof o.userName === "string" &&
    typeof o.createdAt === "string" &&
    o.type === "message" &&
    (o.avatarUrl === undefined || typeof o.avatarUrl === "string")
  );
}

function isConversationParticipantSummary(
  value: unknown,
): value is ConversationParticipantSummary {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.displayName === "string" &&
    (o.avatarUrl === undefined || typeof o.avatarUrl === "string")
  );
}

function isConversationInboxItem(value: unknown): value is ConversationInboxItem {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.updatedAt !== "string" ||
    typeof o.unreadCount !== "number" ||
    !isConversationParticipantSummary(o.otherParticipant)
  ) {
    return false;
  }
  if (o.topic !== undefined && typeof o.topic !== "string") return false;
  if (o.lastMessage !== undefined && !isChatMessage(o.lastMessage)) return false;
  return true;
}

function isConversationSummary(value: unknown): value is ConversationSummary {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.updatedAt !== "string" ||
    !isConversationParticipantSummary(o.otherParticipant)
  ) {
    return false;
  }
  if (o.topic !== undefined && typeof o.topic !== "string") return false;
  return true;
}

export function parseConversationsListResponse(
  data: unknown,
): ConversationsListResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid conversations list: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid conversations list: items must be an array");
  }
  if (!o.items.every(isConversationInboxItem)) {
    throw new Error("Invalid conversations list: item shape");
  }
  return { items: o.items };
}

export function parseCreateConversationResponse(
  data: unknown,
): CreateConversationResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid create conversation: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!isConversationSummary(o.item)) {
    throw new Error("Invalid create conversation: item shape");
  }
  return { item: o.item };
}

export function parseMessagesListResponse(data: unknown): MessagesListResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid messages list: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid messages list: items must be an array");
  }
  if (!o.items.every(isChatMessage)) {
    throw new Error("Invalid messages list: item shape");
  }
  if (typeof o.pagination !== "object" || o.pagination === null) {
    throw new Error("Invalid messages list: pagination shape");
  }
  const p = o.pagination as Record<string, unknown>;
  if (
    typeof p.page !== "number" ||
    typeof p.limit !== "number" ||
    typeof p.total !== "number"
  ) {
    throw new Error("Invalid messages list: pagination shape");
  }
  return {
    items: o.items,
    pagination: { page: p.page, limit: p.limit, total: p.total },
  };
}

export function parseCreateMessageResponse(
  data: unknown,
): CreateMessageResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid create message: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!isChatMessage(o.item)) {
    throw new Error("Invalid create message: item shape");
  }
  return { item: o.item };
}

export function parseMarkConversationReadResponse(
  data: unknown,
): MarkConversationReadResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid mark read: expected object");
  }
  const o = data as Record<string, unknown>;
  if (o.ok !== true || typeof o.lastReadAt !== "string") {
    throw new Error("Invalid mark read: shape");
  }
  return { ok: true, lastReadAt: o.lastReadAt };
}

export type FetchFeedResult =
  | { ok: true; data: FeedResponse }
  | { ok: false; error: string };

export type FetchSubjectsResult =
  | { ok: true; data: SubjectsResponse }
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

export type FetchPublicUserResult =
  | { ok: true; data: PublicUserResponse }
  | { ok: false; error: string; status?: number };

export type FetchMyListResult =
  | { ok: true; data: MyHelpRequestsResponse }
  | { ok: false; error: string; status?: number };

export type FetchResourcesResult =
  | { ok: true; data: ResourcesListResponse }
  | { ok: false; error: string };

export type FetchResourceResult =
  | { ok: true; data: ResourceDetailResponse }
  | { ok: false; error: string; status?: number };

export type FetchMentorDashboardResult =
  | { ok: true; data: MentorDashboardResponse }
  | { ok: false; error: string; status?: number };

export type FetchConversationsResult =
  | { ok: true; data: ConversationsListResponse }
  | { ok: false; error: string; status?: number };

export type FetchConversationMessagesResult =
  | { ok: true; data: MessagesListResponse }
  | { ok: false; error: string; status?: number };

export type MessagesPageParams = {
  page?: number;
  limit?: number;
};

export const MESSAGES_DEFAULT_LIMIT = 50;

function buildMessagesQueryString(params: MessagesPageParams): string {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set("page", String(params.page));
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

export type ResourcesPageParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export const RESOURCES_DEFAULT_LIMIT = 12;

function buildResourcesQueryString(params: ResourcesPageParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page !== undefined) sp.set("page", String(params.page));
  if (params.limit !== undefined) sp.set("limit", String(params.limit));
  const qs = sp.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

function isPublicUserResponse(value: unknown): value is PublicUserResponse {
  if (typeof value !== "object" || value === null) return false;
  const o = value as Record<string, unknown>;
  if (typeof o.profile !== "object" || o.profile === null) return false;
  const profile = o.profile as Record<string, unknown>;
  if (
    typeof profile.id !== "string" ||
    typeof profile.displayName !== "string" ||
    typeof profile.role !== "string"
  ) {
    return false;
  }
  if (o.tab !== "posts" && o.tab !== "responses") return false;
  if (!Array.isArray(o.items)) return false;
  if (typeof o.pagination !== "object" || o.pagination === null) return false;
  const pagination = o.pagination as Record<string, unknown>;
  return (
    typeof pagination.page === "number" &&
    typeof pagination.limit === "number" &&
    typeof pagination.total === "number"
  );
}

export function parsePublicUserResponse(data: unknown): PublicUserResponse {
  if (!isPublicUserResponse(data)) {
    throw new Error("Invalid public user payload");
  }
  if (data.tab === "posts" && !data.items.every(isHelpRequest)) {
    throw new Error("Invalid public user posts");
  }
  if (data.tab === "responses" && !data.items.every(isResponse)) {
    throw new Error("Invalid public user responses");
  }
  return data;
}

export function parseMyHelpRequestsResponse(
  data: unknown,
): MyHelpRequestsResponse {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid my list: expected object");
  }
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.items)) {
    throw new Error("Invalid my list: items must be an array");
  }
  if (!o.items.every(isHelpRequest)) {
    throw new Error("Invalid my list: item shape");
  }
  return { items: o.items };
}

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

export async function fetchFeed(
  params?: FeedPageParams,
): Promise<FetchFeedResult> {
  const resolved = params ?? { page: 1, limit: FEED_DEFAULT_LIMIT };
  const query = buildFeedQueryString(resolved, { includeWidgets: true });
  const url = `${getApiBaseUrl()}/feed${query}`;
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

export async function fetchSubjects(): Promise<FetchSubjectsResult> {
  const url = `${getApiBaseUrl()}/subjects`;
  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return {
        ok: false,
        error: `Subjects HTTP ${res.status}`,
      };
    }
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      return { ok: false, error: "Subjects response is not JSON" };
    }
    try {
      return { ok: true, data: parseSubjectsResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid subjects payload";
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

export async function fetchPublicUser(
  userId: string,
  params?: PublicUserPageParams,
): Promise<FetchPublicUserResult> {
  const query = buildPublicUserQueryString(
    params ?? { tab: "posts", page: 1, limit: PUBLIC_USER_DEFAULT_LIMIT },
  );
  const url = `${getApiBaseUrl()}/users/${encodeURIComponent(userId)}${query}`;
  try {
    const { ok, status, json } = await fetchJson(url, { cache: "no-store" });
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
          : `Public user HTTP ${status}`;
      return { ok: false, error: err, status };
    }
    try {
      return { ok: true, data: parsePublicUserResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid public user payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

async function fetchMyList(
  path: "/me/help-requests" | "/me/bookmarks",
  accessToken: string,
): Promise<FetchMyListResult> {
  const url = `${getApiBaseUrl()}${path}`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized", status: 401 };
    }
    if (!ok) {
      const err =
        typeof json === "object" &&
        json !== null &&
        "error" in json &&
        typeof (json as { error: unknown }).error === "string"
          ? (json as { error: string }).error
          : `My list HTTP ${status}`;
      return { ok: false, error: err, status };
    }
    try {
      return { ok: true, data: parseMyHelpRequestsResponse(json) };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Invalid my list payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchMyHelpRequests(
  accessToken: string,
): Promise<FetchMyListResult> {
  return fetchMyList("/me/help-requests", accessToken);
}

export async function fetchMyBookmarks(
  accessToken: string,
): Promise<FetchMyListResult> {
  return fetchMyList("/me/bookmarks", accessToken);
}

export async function fetchResources(
  params?: ResourcesPageParams,
): Promise<FetchResourcesResult> {
  const resolved = params ?? { page: 1, limit: RESOURCES_DEFAULT_LIMIT };
  const query = buildResourcesQueryString(resolved);
  const url = `${getApiBaseUrl()}/resources${query}`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      next: { revalidate: 60 },
    });
    if (!ok) {
      return { ok: false, error: `Resources HTTP ${status}` };
    }
    try {
      return { ok: true, data: parseResourcesListResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid resources payload";
      return { ok: false, error: message };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchResource(
  id: string,
  accessToken?: string,
): Promise<FetchResourceResult> {
  const url = `${getApiBaseUrl()}/resources/${encodeURIComponent(id)}`;
  const headers: HeadersInit = accessToken
    ? { authorization: `Bearer ${accessToken}` }
    : {};
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers,
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
          : `Resource HTTP ${status}`;
      return { ok: false, error: err, status };
    }
    try {
      return { ok: true, data: parseResourceDetailResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid resource payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchMentorDashboard(
  accessToken: string,
): Promise<FetchMentorDashboardResult> {
  const url = `${getApiBaseUrl()}/mentor/dashboard`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized", status: 401 };
    }
    if (status === 403) {
      return { ok: false, error: "forbidden", status: 403 };
    }
    if (!ok) {
      return { ok: false, error: `Mentor dashboard HTTP ${status}`, status };
    }
    try {
      return { ok: true, data: parseMentorDashboardResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid mentor dashboard payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchConversations(
  accessToken: string,
): Promise<FetchConversationsResult> {
  const url = `${getApiBaseUrl()}/conversations`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized", status: 401 };
    }
    if (!ok) {
      return { ok: false, error: `Conversations HTTP ${status}`, status };
    }
    try {
      return { ok: true, data: parseConversationsListResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid conversations payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}

export async function fetchConversationMessages(
  conversationId: string,
  accessToken: string,
  params?: MessagesPageParams,
): Promise<FetchConversationMessagesResult> {
  const resolved = params ?? { page: 1, limit: MESSAGES_DEFAULT_LIMIT };
  const query = buildMessagesQueryString(resolved);
  const url = `${getApiBaseUrl()}/conversations/${encodeURIComponent(conversationId)}/messages${query}`;
  try {
    const { ok, status, json } = await fetchJson(url, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (status === 401) {
      return { ok: false, error: "unauthorized", status: 401 };
    }
    if (status === 403) {
      return { ok: false, error: "forbidden", status: 403 };
    }
    if (!ok) {
      return {
        ok: false,
        error: `Messages HTTP ${status}`,
        status,
      };
    }
    try {
      return { ok: true, data: parseMessagesListResponse(json) };
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Invalid messages payload";
      return { ok: false, error: message, status };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { ok: false, error: message };
  }
}
