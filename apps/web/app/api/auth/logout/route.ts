import { getApiBaseUrl } from "@/lib/api-server";
import { relayJsonWithCookies } from "@/lib/bff-relay";

export async function POST() {
  const res = await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
  });
  return relayJsonWithCookies(res);
}
