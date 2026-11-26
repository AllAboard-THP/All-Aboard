import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/conversations/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
}
