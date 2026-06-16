import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayJsonResponse,
} from "@/lib/bff-relay";

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }

  const formData = await request.formData();
  const res = await fetch(`${getApiBaseUrl()}/users/me/avatar`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return relayJsonResponse(res);
}

export async function DELETE() {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }

  const res = await fetch(`${getApiBaseUrl()}/users/me/avatar`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return relayJsonResponse(res);
}
