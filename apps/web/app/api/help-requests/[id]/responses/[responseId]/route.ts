import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string; responseId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, responseId } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/help-requests/${encodeURIComponent(id)}/responses/${encodeURIComponent(responseId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body,
    },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, responseId } = await context.params;
  return relayAuthenticatedFetch(
    `/help-requests/${encodeURIComponent(id)}/responses/${encodeURIComponent(responseId)}`,
    { method: "DELETE" },
  );
}
