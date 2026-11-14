import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/admin/denylist-patterns/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/admin/denylist-patterns/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
