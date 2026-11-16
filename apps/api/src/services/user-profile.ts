import { and, count, eq, inArray, isNull, or } from "drizzle-orm";
import type { SubjectSummary } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { authorIdKeysFromRow } from "../lib/auth-helpers.js";
import { isUuid } from "../auth/passkey/config.js";
import {
  helpRequests,
  mentorSubjects,
  responses,
  subjects,
  users,
} from "../db/schema.js";
import { displayNameFromUser, rowToSubjectSummary } from "../lib/user-mappers.js";

const LEGACY_USER_EMAIL: Record<string, string> = {
  bob: "bob@dev.local",
  alice: "alice@dev.local",
};

export async function loadUserFromJwtSub(db: AppDatabase, sub: string) {
  if (isUuid(sub)) {
    return loadUserById(db, sub);
  }
  let email = sub.trim().toLowerCase();
  if (!email.includes("@")) {
    email = LEGACY_USER_EMAIL[email] ?? email;
  }
  return loadUserByEmail(db, email);
}

export async function loadUserByEmail(db: AppDatabase, email: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}

export async function loadUserById(db: AppDatabase, id: string) {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function loadCompetenceSubjects(
  db: AppDatabase,
  userId: string,
): Promise<SubjectSummary[]> {
  const rows = await db
    .select({ subject: subjects })
    .from(mentorSubjects)
    .innerJoin(subjects, eq(mentorSubjects.subjectId, subjects.id))
    .where(eq(mentorSubjects.userId, userId));
  return rows.map(({ subject }) => rowToSubjectSummary(subject));
}

/** Public identity of a help request or response author. */
export type AuthorProfile = { id: string; displayName: string };

/**
 * Resolves `author_id` values to registered users. `author_id` is text and may
 * hold the user uuid, the email, or a legacy short name (`bob`), so the map is
 * keyed by every lower-cased form of each user (see `authorIdKeysFromRow`).
 */
export async function loadAuthorProfiles(
  db: AppDatabase,
  authorIds: string[],
): Promise<Map<string, AuthorProfile>> {
  const keys = [...new Set(authorIds.map((id) => id.trim().toLowerCase()))].filter(
    Boolean,
  );
  if (keys.length === 0) {
    return new Map();
  }

  const ids = keys.filter((key) => isUuid(key));
  const emails = keys
    .filter((key) => !isUuid(key))
    .map((key) => (key.includes("@") ? key : (LEGACY_USER_EMAIL[key] ?? null)))
    .filter((email): email is string => Boolean(email));

  const conditions = [
    ...(ids.length > 0 ? [inArray(users.id, ids)] : []),
    ...(emails.length > 0 ? [inArray(users.email, emails)] : []),
  ];
  if (conditions.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(conditions.length === 1 ? conditions[0] : or(...conditions));

  const byKey = new Map<string, AuthorProfile>();
  for (const row of rows) {
    const profile = { id: row.id, displayName: displayNameFromUser(row) };
    for (const key of authorIdKeysFromRow(row)) {
      byKey.set(key.toLowerCase(), profile);
    }
  }
  return byKey;
}

/** Looks up one `author_id` in a map from {@link loadAuthorProfiles}. */
export function authorProfileFor(
  profiles: Map<string, AuthorProfile>,
  authorId: string,
): AuthorProfile | undefined {
  return profiles.get(authorId.trim().toLowerCase());
}

export async function syncMentorSubjects(
  db: AppDatabase,
  userId: string,
  subjectIds: string[],
): Promise<SubjectSummary[]> {
  const uniqueIds = [...new Set(subjectIds)];
  await db.delete(mentorSubjects).where(eq(mentorSubjects.userId, userId));

  if (uniqueIds.length > 0) {
    const existing = await db
      .select({ id: subjects.id, slug: subjects.slug })
      .from(subjects)
      .where(inArray(subjects.id, uniqueIds));
    if (existing.length > 0) {
      await db.insert(mentorSubjects).values(
        existing.map((s) => ({
          userId,
          subjectId: s.id,
        })),
      );
      const slugs = existing.map((s) => s.slug);
      await db
        .update(users)
        .set({
          certificationTags: slugs,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  } else {
    await db
      .update(users)
      .set({ certificationTags: [], updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  return loadCompetenceSubjects(db, userId);
}

export async function countUserPosts(
  db: AppDatabase,
  user: { id: string; email: string },
): Promise<number> {
  const keys = authorIdKeysFromRow(user);
  const rows = await db
    .select({ value: count() })
    .from(helpRequests)
    .where(
      and(
        inArray(helpRequests.authorId, keys),
        isNull(helpRequests.deletedAt),
        eq(helpRequests.flaggedForModeration, false),
      ),
    );
  return Number(rows[0]?.value ?? 0);
}

export async function countUserResponses(
  db: AppDatabase,
  user: { id: string; email: string },
): Promise<number> {
  const keys = authorIdKeysFromRow(user);
  const rows = await db
    .select({ value: count() })
    .from(responses)
    .where(inArray(responses.authorId, keys));
  return Number(rows[0]?.value ?? 0);
}
