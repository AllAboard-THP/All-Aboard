import { getApiBaseUrl } from "@/lib/api-server";
import {
  getAccessToken,
  missingTokenResponse,
  relayJsonResponse,
} from "@/lib/bff-relay";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return missingTokenResponse();
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "missing_file" }, { status: 400 });
  }

  const mimeType = file.type;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return Response.json({ error: "invalid_file_type" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await fetch(`${getApiBaseUrl()}/users/me/avatar`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      imageBase64: buffer.toString("base64"),
      mimeType,
    }),
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
