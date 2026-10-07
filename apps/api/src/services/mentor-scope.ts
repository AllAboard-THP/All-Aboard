import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { mentorSubjects, resources } from "../db/schema.js";

export async function loadMentorSubjectIds(
  db: AppDatabase,
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ subjectId: mentorSubjects.subjectId })
    .from(mentorSubjects)
    .where(eq(mentorSubjects.userId, userId));
  return rows.map((r) => r.subjectId);
}

export function subjectInMentorScope(
  subjectId: string | null | undefined,
  mentorSubjectIds: string[],
): boolean {
  if (!subjectId || mentorSubjectIds.length === 0) return false;
  return mentorSubjectIds.includes(subjectId);
}

export function mentorPendingResourcesWhere(
  mentorSubjectIds: string[],
): SQL | undefined {
  if (mentorSubjectIds.length === 0) return sql`false`;
  return and(
    eq(resources.status, "pending"),
    inArray(resources.subjectId, mentorSubjectIds),
  );
}
