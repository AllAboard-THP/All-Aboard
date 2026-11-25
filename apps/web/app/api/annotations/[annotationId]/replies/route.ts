import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ annotationId: string }> };

/** #197 — reply in an annotation's thread. */
export async function POST(request: Request, context: RouteContext) {
  const { annotationId } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/annotations/${encodeURIComponent(annotationId)}/replies`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body.trim().length > 0 ? body : "{}",
    },
  );
}
