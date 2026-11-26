import { cookies } from "next/headers";

import type { AuthMeResponse } from "@allaboard/types";

import { fetchAuthMe } from "@/lib/api-server";

export type AdminSessionDeniedReason = "unauthenticated" | "forbidden";

export type AdminSessionResult =
  | { ok: true; user: AuthMeResponse }
  | { ok: false; reason: AdminSessionDeniedReason };

/** Server guard for `/admin/*` — requires `role === admin`. */
export async function requireAdminSession(): Promise<AdminSessionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return { ok: false, reason: "unauthenticated" };
  }

  const meResult = await fetchAuthMe(token);
  if (!meResult.ok) {
    return { ok: false, reason: "unauthenticated" };
  }

  if (meResult.data.role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, user: meResult.data };
}
