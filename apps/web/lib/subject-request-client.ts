import type {
  CreateSubjectRequestBody,
  CreateSubjectRequestResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function createSubjectRequest(
  body: CreateSubjectRequestBody,
): Promise<CreateSubjectRequestResponse> {
  const payload: CreateSubjectRequestBody = {
    name: body.name.trim(),
    ...(body.description?.trim()
      ? { description: body.description.trim() }
      : {}),
  };

  const res = await fetch("/api/subject-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateSubjectRequestResponse;
}
