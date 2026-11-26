import { getApiBaseUrl } from "@/lib/api-server";
import { relayJsonWithCookies } from "@/lib/bff-relay";

export async function POST(request: Request) {
  const body = await request.text();
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return relayJsonWithCookies(res);
}
