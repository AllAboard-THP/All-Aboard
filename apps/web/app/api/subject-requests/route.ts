import { relayAuthenticatedFetch } from "@/lib/bff-relay";

export async function POST(request: Request) {
  const body = await request.text();
  return relayAuthenticatedFetch("/subject-requests", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}
