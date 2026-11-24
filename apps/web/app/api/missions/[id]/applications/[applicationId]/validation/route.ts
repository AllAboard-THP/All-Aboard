import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string; applicationId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, applicationId } = await context.params;
  return relayAuthenticatedFetch(
    `/missions/${encodeURIComponent(id)}/applications/${encodeURIComponent(applicationId)}/validation`,
    { method: "DELETE" },
  );
}
