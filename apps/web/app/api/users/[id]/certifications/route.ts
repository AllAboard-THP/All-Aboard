import { relayAuthenticatedFetch, relayPublicGet } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayPublicGet(
    request,
    `/users/${encodeURIComponent(id)}/certifications`,
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/users/${encodeURIComponent(id)}/certifications`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body.trim().length > 0 ? body : "{}",
    },
  );
}
