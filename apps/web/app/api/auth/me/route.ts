import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayJsonResponse,
} from "@/lib/bff-relay";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }
  const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return relayJsonResponse(res);
}
