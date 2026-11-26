import type {
  AdminUserSummary,
  CreateDenylistPatternBody,
  CreateDenylistPatternResponse,
  DenylistPattern,
  SubjectRequestStatus,
  UpdateAdminSubjectRequestResponse,
  UpdateDenylistPatternResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

async function adminFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throwFromApiResponse(res.status, text);
  }
  return res;
}

export async function approveModerationHelpRequest(
  id: string,
): Promise<void> {
  await adminFetch(
    `/api/admin/moderation/help-requests/${encodeURIComponent(id)}/approve`,
    { method: "POST" },
  );
}

export async function rejectModerationHelpRequest(id: string): Promise<void> {
  await adminFetch(
    `/api/admin/moderation/help-requests/${encodeURIComponent(id)}/reject`,
    { method: "POST" },
  );
}

export async function approveModerationResponse(id: string): Promise<void> {
  await adminFetch(
    `/api/admin/moderation/responses/${encodeURIComponent(id)}/approve`,
    { method: "POST" },
  );
}

export async function rejectModerationResponse(id: string): Promise<void> {
  await adminFetch(
    `/api/admin/moderation/responses/${encodeURIComponent(id)}/reject`,
    { method: "POST" },
  );
}

export async function createDenylistPattern(
  body: CreateDenylistPatternBody,
): Promise<CreateDenylistPatternResponse> {
  const res = await adminFetch("/api/admin/denylist-patterns", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as CreateDenylistPatternResponse;
}

export async function updateDenylistPatternActive(
  id: string,
  active: boolean,
): Promise<UpdateDenylistPatternResponse> {
  const res = await adminFetch(
    `/api/admin/denylist-patterns/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active }),
    },
  );
  return (await res.json()) as UpdateDenylistPatternResponse;
}

export async function deleteDenylistPattern(id: string): Promise<void> {
  await adminFetch(
    `/api/admin/denylist-patterns/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function promoteAdminUser(
  id: string,
  admin: boolean,
): Promise<{ item: AdminUserSummary }> {
  const res = await adminFetch(
    `/api/admin/users/${encodeURIComponent(id)}/promote-admin`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ admin }),
    },
  );
  return (await res.json()) as { item: AdminUserSummary };
}

export async function toggleMentorUser(
  id: string,
): Promise<{ item: AdminUserSummary }> {
  const res = await adminFetch(
    `/api/admin/users/${encodeURIComponent(id)}/promote-mentor`,
    { method: "POST" },
  );
  return (await res.json()) as { item: AdminUserSummary };
}

export async function updateSubjectRequestStatus(
  id: string,
  status: SubjectRequestStatus,
): Promise<UpdateAdminSubjectRequestResponse> {
  const res = await adminFetch(
    `/api/admin/subject-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return (await res.json()) as UpdateAdminSubjectRequestResponse;
}

export type { DenylistPattern };
