import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

function missionPath(id: string): string {
  return `/missions/${encodeURIComponent(id)}`;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(missionPath(id), { method: "GET" });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(missionPath(id), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body.trim().length > 0 ? body : "{}",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(missionPath(id), { method: "DELETE" });
}
