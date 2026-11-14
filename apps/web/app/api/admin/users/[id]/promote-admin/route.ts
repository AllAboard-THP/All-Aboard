import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  return relayAuthenticatedFetch(
    `/admin/users/${encodeURIComponent(id)}/promote-admin`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    },
  );
}
