import type { SubjectSummary, UserProfile, UserPublicProfile } from "@allaboard/types";
import type { subjects, users } from "../db/schema.js";

type UserRow = typeof users.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;

export function displayNameFromUser(row: Pick<UserRow, "fullName" | "email">): string {
  const name = row.fullName?.trim();
  if (name) return name;
  const local = row.email.split("@")[0] ?? row.email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function rowToSubjectSummary(row: SubjectRow): SubjectSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    accentColor: row.accentColor,
  };
}

export function rowToUserProfile(
  row: UserRow,
  competenceSubjects: SubjectSummary[] = [],
): UserProfile {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    displayName: displayNameFromUser(row),
    fullName: row.fullName ?? undefined,
    headline: row.headline ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    educationLevel: row.educationLevel ?? undefined,
    cguAcceptedAt: row.cguAcceptedAt?.toISOString(),
    notifyOnComment: row.notifyOnComment,
    notifyOnMessage: row.notifyOnMessage,
    certificationTags: row.certificationTags,
    competenceSubjects:
      competenceSubjects.length > 0 ? competenceSubjects : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function rowToUserPublicProfile(
  row: UserRow,
  stats: { postsCount: number; responsesCount: number },
  competenceSubjects: SubjectSummary[] = [],
): UserPublicProfile {
  return {
    id: row.id,
    role: row.role,
    displayName: displayNameFromUser(row),
    headline: row.headline ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    educationLevel: row.educationLevel ?? undefined,
    competenceSubjects:
      competenceSubjects.length > 0 ? competenceSubjects : undefined,
    stats,
    createdAt: row.createdAt.toISOString(),
  };
}
