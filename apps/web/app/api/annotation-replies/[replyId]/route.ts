import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ replyId: string }> };

async function replyPath(context: RouteContext): Promise<string> {
  const { replyId } = await context.params;
  return `/annotation-replies/${encodeURIComponent(replyId)}`;
}

/** #197 — edit or soft delete a reply (author only). */
export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.text();
  return relayAuthenticatedFetch(await replyPath(context), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body.trim().length > 0 ? body : "{}",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return relayAuthenticatedFetch(await replyPath(context), { method: "DELETE" });
}
