import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/missions/${encodeURIComponent(id)}/applications/mine`,
    { method: "DELETE" },
  );
}
