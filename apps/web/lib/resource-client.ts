import type {
  CreateResourceBody,
  CreateResourceResponse,
  UpdateResourceBody,
  UpdateResourceResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function createResource(
  body: CreateResourceBody,
): Promise<CreateResourceResponse> {
  const res = await fetch("/api/resources", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateResourceResponse;
}

export async function updateResource(
  id: string,
  body: UpdateResourceBody,
): Promise<UpdateResourceResponse> {
  const res = await fetch(`/api/resources/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as UpdateResourceResponse;
}

export async function deleteResource(id: string): Promise<void> {
  const res = await fetch(`/api/resources/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204 || res.ok) {
    return;
  }
  throwFromApiResponse(res.status, await res.text());
}
