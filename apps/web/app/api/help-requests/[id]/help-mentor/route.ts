import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/help-requests/${encodeURIComponent(id)}/help-mentor`,
    { method: "POST" },
  );
}
