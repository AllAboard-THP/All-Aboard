import type {
  CreateConversationBody,
  CreateConversationResponse,
  CreateMessageResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function createConversation(
  body: CreateConversationBody,
): Promise<CreateConversationResponse> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateConversationResponse;
}

export async function sendChatMessage(
  conversationId: string,
  body: string,
): Promise<CreateMessageResponse> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateMessageResponse;
}

/** Sends audio/video via multipart (kind, file, durationMs, source, optional body). */
export async function sendChatMediaMessage(
  conversationId: string,
  formData: FormData,
): Promise<CreateMessageResponse> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateMessageResponse;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throwFromApiResponse(res.status, text);
  }
}

export async function fetchConversationWsToken(
  conversationId: string,
): Promise<{ token: string; expiresIn: number }> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/ws-token`,
    { credentials: "include", cache: "no-store" },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as { token: string; expiresIn: number };
}
