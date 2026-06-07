import { and, count, eq, inArray, isNull } from "drizzle-orm";
import type { SubjectSummary } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  helpRequests,
  mentorSubjects,
  responses,
  subjects,
  users,
} from "../db/schema.js";
import { rowToSubjectSummary } from "../lib/user-mappers.js";

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
  authorEmail: string,
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(helpRequests)
    .where(
      and(
        eq(helpRequests.authorId, authorEmail),
        isNull(helpRequests.deletedAt),
        eq(helpRequests.flaggedForModeration, false),
      ),
    );
  return Number(rows[0]?.value ?? 0);
}

export async function countUserResponses(
  db: AppDatabase,
  authorEmail: string,
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(responses)
    .where(eq(responses.authorId, authorEmail));
  return Number(rows[0]?.value ?? 0);
}
