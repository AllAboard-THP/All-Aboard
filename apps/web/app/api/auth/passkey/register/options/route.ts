import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  relayJsonResponse,
  relayPostJson,
} from "@/lib/bff-relay";

export async function POST(request: Request) {
  const body = await request.text();
  const token = await getAccessToken();
  if (!token) {
    return relayPostJson("/auth/passkey/register/options", body);
  }
  const res = await fetch(`${getApiBaseUrl()}/auth/passkey/register/options`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body.length > 0 ? body : "{}",
  });
  return relayJsonResponse(res);
}
