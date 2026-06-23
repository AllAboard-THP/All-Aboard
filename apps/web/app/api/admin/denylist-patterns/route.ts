import { relayAuthenticatedFetch } from "@/lib/bff-relay";

export async function GET() {
  return relayAuthenticatedFetch("/admin/denylist-patterns", {
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  return relayAuthenticatedFetch("/admin/denylist-patterns", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}
