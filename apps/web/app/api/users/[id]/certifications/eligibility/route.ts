import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return relayAuthenticatedFetch(
    `/users/${encodeURIComponent(id)}/certifications/eligibility`,
    { cache: "no-store" },
  );
}
