import type {
  UpdateHelpRequestBody,
  UpdateHelpRequestResponse,
  UpdateResponseBody,
  UpdateResponseResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function updateHelpRequest(
  id: string,
  body: UpdateHelpRequestBody,
): Promise<UpdateHelpRequestResponse> {
  const res = await fetch(`/api/help-requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as UpdateHelpRequestResponse;
}

export async function deleteHelpRequest(id: string): Promise<void> {
  const res = await fetch(`/api/help-requests/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204 || res.ok) {
    return;
  }
  throwFromApiResponse(res.status, await res.text());
}

export async function updateResponse(
  helpRequestId: string,
  responseId: string,
  body: UpdateResponseBody,
): Promise<UpdateResponseResponse> {
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(helpRequestId)}/responses/${encodeURIComponent(responseId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as UpdateResponseResponse;
}

export async function deleteResponse(
  helpRequestId: string,
  responseId: string,
): Promise<void> {
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(helpRequestId)}/responses/${encodeURIComponent(responseId)}`,
    { method: "DELETE", credentials: "include" },
  );
  if (res.status === 204 || res.ok) {
    return;
  }
  throwFromApiResponse(res.status, await res.text());
}
