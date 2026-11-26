import type {
  CreateCertificationBody,
  CreateCertificationResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

function certificationsPath(userId: string): string {
  return `/api/users/${encodeURIComponent(userId)}/certifications`;
}

export async function giveCertification(
  userId: string,
  body: CreateCertificationBody,
): Promise<CreateCertificationResponse> {
  const res = await fetch(certificationsPath(userId), {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateCertificationResponse;
}

export async function withdrawCertification(
  userId: string,
  certificationId: string,
): Promise<void> {
  const res = await fetch(
    `${certificationsPath(userId)}/${encodeURIComponent(certificationId)}`,
    { method: "DELETE", credentials: "include" },
  );
  if (!res.ok) {
    throwFromApiResponse(res.status, await res.text());
  }
}
