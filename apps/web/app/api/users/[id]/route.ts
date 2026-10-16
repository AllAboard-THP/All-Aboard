import { getApiBaseUrl } from "@/lib/api-server";
import { relayJsonResponse } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const suffix = qs.length > 0 ? `?${qs}` : "";
  const res = await fetch(
    `${getApiBaseUrl()}/users/${encodeURIComponent(id)}${suffix}`,
    { cache: "no-store" },
  );
  return relayJsonResponse(res);
}
