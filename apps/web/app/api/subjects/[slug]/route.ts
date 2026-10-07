import { relayPublicGet } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  return relayPublicGet(request, `/subjects/${encodeURIComponent(slug)}`);
}
