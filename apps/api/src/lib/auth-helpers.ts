import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  loadUserByEmail,
  loadUserById,
} from "../services/user-profile.js";
import { isUuid } from "../auth/passkey/config.js";

const LEGACY_USER_EMAIL: Record<string, string> = {
  bob: "bob@dev.local",
  alice: "alice@dev.local",
};

export function jwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production (min 32 characters)");
  }
  return "dev-only-jwt-secret-min-32-characters!!";
}

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function roleFromJwtClaims(
  sub: string,
  roleClaim: string | undefined,
): UserRole {
  if (
    roleClaim === "mentor" ||
    roleClaim === "student" ||
    roleClaim === "admin"
  ) {
    return roleClaim;
  }
  if (sub.endsWith("@dev.local")) {
    return sub.startsWith("alice@") ? "mentor" : "student";
  }
  return "student";
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function tagsOverlap(requestTags: string[], authorCerts: string[]): boolean {
  if (requestTags.length === 0 || authorCerts.length === 0) return false;
  const requestSet = new Set(requestTags.map(normalizeTag));
  return authorCerts.some((c) => requestSet.has(normalizeTag(c)));
}

export function responseVisibleUnderCertificationFilter(
  responseAuthorId: string,
  requestAuthorId: string,
  requestTags: string[],
  authorCerts: string[],
): boolean {
  if (responseAuthorId === requestAuthorId) return true;
  return tagsOverlap(requestTags, authorCerts);
}

export type JwtUser = { sub: string; role?: UserRole };

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

export async function resolveAuthenticatedUser(
  db: AppDatabase,
  sub: string,
  roleClaim?: UserRole,
): Promise<AuthenticatedUser | null> {
  if (isUuid(sub)) {
    const row = await loadUserById(db, sub);
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      role: roleFromJwtClaims(sub, roleClaim ?? row.role),
    };
  }

  let email = sub.trim().toLowerCase();
  if (!email.includes("@")) {
    email = LEGACY_USER_EMAIL[email] ?? email;
  }

  const row = await loadUserByEmail(db, email);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    role: roleFromJwtClaims(sub, roleClaim ?? row.role),
  };
}

export function authorIdMatchesUser(
  authorId: string,
  user: AuthenticatedUser,
): boolean {
  if (authorId === user.id || authorId === user.email) return true;
  const shortName = user.email.split("@")[0];
  return authorId === shortName;
}

export function userAuthorIdKeys(user: AuthenticatedUser): string[] {
  const shortName = user.email.split("@")[0];
  return [user.id, user.email, shortName];
}

/** Keys stored in help_requests/responses.author_id for a users row. */
export function authorIdKeysFromRow(user: {
  id: string;
  email: string;
}): string[] {
  const shortName = user.email.split("@")[0];
  return [user.id, user.email, shortName];
}

export function getJwtUser(request: { user: unknown }): JwtUser {
  return request.user as JwtUser;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}
