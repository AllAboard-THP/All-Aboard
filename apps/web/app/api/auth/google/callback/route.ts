import { getApiBaseUrl } from "@/lib/api-server";
import { relayRedirectWithCookies } from "@/lib/bff-relay";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const upstream = new URL(`${getApiBaseUrl()}/auth/google/callback`);
  upstream.search = url.search;

  const res = await fetch(upstream.toString(), {
    redirect: "manual",
  });
  return relayRedirectWithCookies(res);
}
