import {
  relayAuthenticatedFetch,
  upstreamQuerySuffix,
} from "@/lib/bff-relay";

export async function GET(request: Request) {
  return relayAuthenticatedFetch(`/missions${upstreamQuerySuffix(request)}`, {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  return relayAuthenticatedFetch("/missions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body.trim().length > 0 ? body : "{}",
  });
}
