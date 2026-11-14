import type {
  MyHelpRequestsResponse,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function fetchMyBookmarks(): Promise<MyHelpRequestsResponse> {
  const res = await fetch("/api/me/bookmarks", { credentials: "include" });
  if (res.status === 401) {
    return { items: [] };
  }
  if (!res.ok) {
    throwFromApiResponse(res.status, await res.text());
  }
  return (await res.json()) as MyHelpRequestsResponse;
}

export async function toggleLike(
  helpRequestId: string,
): Promise<ToggleLikeResponse> {
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(helpRequestId)}/likes`,
    { method: "POST", credentials: "include" },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as ToggleLikeResponse;
}

export async function toggleBookmark(
  helpRequestId: string,
): Promise<ToggleBookmarkResponse> {
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(helpRequestId)}/bookmarks`,
    { method: "POST", credentials: "include" },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as ToggleBookmarkResponse;
}
