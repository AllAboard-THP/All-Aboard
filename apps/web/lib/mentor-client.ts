import type { ApproveResourceResponse } from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function approveMentorResource(
  id: string,
): Promise<ApproveResourceResponse> {
  const res = await fetch(
    `/api/mentor/resources/${encodeURIComponent(id)}/approve`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as ApproveResourceResponse;
}

export async function rejectMentorResource(
  id: string,
): Promise<ApproveResourceResponse> {
  const res = await fetch(
    `/api/mentor/resources/${encodeURIComponent(id)}/reject`,
    {
      method: "POST",
      credentials: "include",
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as ApproveResourceResponse;
}
