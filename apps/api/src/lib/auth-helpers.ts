import type { UserRole } from "@allaboard/types";

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

export function getJwtUser(request: { user: unknown }): JwtUser {
  return request.user as JwtUser;
}
