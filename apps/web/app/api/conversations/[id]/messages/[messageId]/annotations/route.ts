import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string; messageId: string }> };

async function annotationsPath(context: RouteContext): Promise<string> {
  const { id, messageId } = await context.params;
  return `/conversations/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/annotations`;
}

/** #197 — annotations of a video message, with their replies. */
export async function GET(_request: Request, context: RouteContext) {
  return relayAuthenticatedFetch(await annotationsPath(context), {
    method: "GET",
    cache: "no-store",
  });
}

export async function POST(request: Request, context: RouteContext) {
  const body = await request.text();
  return relayAuthenticatedFetch(await annotationsPath(context), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body.trim().length > 0 ? body : "{}",
  });
}
