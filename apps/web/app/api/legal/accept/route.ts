import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayJsonResponse,
} from "@/lib/bff-relay";

export async function POST() {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }
  const res = await fetch(`${getApiBaseUrl()}/legal/accept`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  return relayJsonResponse(res);
}
