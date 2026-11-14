import { getApiBaseUrl } from "@/lib/api-server";
import { relayRedirectWithCookies } from "@/lib/bff-relay";

export async function GET() {
  const res = await fetch(`${getApiBaseUrl()}/auth/google`, {
    redirect: "manual",
  });
  return relayRedirectWithCookies(res);
}
