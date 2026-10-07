import type {
  AuthMeResponse,
  PublicUserResponse,
  UpdateUserMeBody,
} from "@allaboard/types";

export type PatchUserProfileInput = UpdateUserMeBody & {
  acceptLegal?: boolean;
};

export type PatchUserProfileResult =
  | { ok: true }
  | { ok: false; code: "profile_update_failed" | "cgu_accept_failed" };

export async function patchUserProfile(
  input: PatchUserProfileInput,
): Promise<PatchUserProfileResult> {
  const { acceptLegal, ...body } = input;

  const patchRes = await fetch("/api/users/me", {
    method: "PATCH",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!patchRes.ok) {
    return { ok: false, code: "profile_update_failed" };
  }

  if (acceptLegal) {
    const legalRes = await fetch("/api/legal/accept", {
      method: "POST",
      credentials: "include",
    });
    if (!legalRes.ok) {
      return { ok: false, code: "cgu_accept_failed" };
    }
  }

  return { ok: true };
}

export async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    throw new Error("auth_me_failed");
  }
  return (await res.json()) as AuthMeResponse;
}

export class PublicProfileNotFoundError extends Error {
  constructor() {
    super("public_profile_not_found");
    this.name = "PublicProfileNotFoundError";
  }
}

export async function fetchPublicUserTab(
  userId: string,
  tab: "posts" | "responses",
  limit = 8,
): Promise<PublicUserResponse> {
  const qs = new URLSearchParams({ tab, limit: String(limit), page: "1" });
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}?${qs}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new PublicProfileNotFoundError();
  }
  if (!res.ok) {
    throw new Error("public_profile_failed");
  }
  return (await res.json()) as PublicUserResponse;
}
