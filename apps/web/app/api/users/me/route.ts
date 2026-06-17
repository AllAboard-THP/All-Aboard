import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayJsonResponse,
} from "@/lib/bff-relay";

export async function PATCH(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }
  const body = await request.text();
  const res = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body,
  });
  return relayJsonResponse(res);
}
