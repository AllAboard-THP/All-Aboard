import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string; messageId: string }> };

/** #197 — read marker behind the unread annotations badge. */
export async function PATCH(_request: Request, context: RouteContext) {
  const { id, messageId } = await context.params;
  return relayAuthenticatedFetch(
    `/conversations/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/annotations/read`,
    { method: "PATCH" },
  );
}
