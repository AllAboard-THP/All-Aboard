const DEFAULT_API_URL = "http://127.0.0.1:4000";

/** API origin exposed to browser code (WebSocket handoff). */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return raw && raw.length > 0 ? raw.replace(/\/$/, "") : DEFAULT_API_URL;
}

export function buildConversationWsUrl(
  conversationId: string,
  token: string,
): string {
  const httpBase = getPublicApiBaseUrl();
  const wsBase = httpBase.replace(/^http/, "ws");
  return `${wsBase}/conversations/${encodeURIComponent(conversationId)}/ws?token=${encodeURIComponent(token)}`;
}
