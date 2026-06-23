import { relayAuthenticatedFetch, upstreamQuerySuffix } from "@/lib/bff-relay";

export async function GET(request: Request) {
  return relayAuthenticatedFetch(
    `/admin/subject-requests${upstreamQuerySuffix(request)}`,
    { cache: "no-store" },
  );
}
