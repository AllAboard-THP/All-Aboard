import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string; applicationId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id, applicationId } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/missions/${encodeURIComponent(id)}/applications/${encodeURIComponent(applicationId)}/validate`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body.trim().length > 0 ? body : "{}",
    },
  );
}
