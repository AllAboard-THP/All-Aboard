import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, subjects } from "../db/schema.js";

export async function decrementResponsesCount(
  db: AppDatabase,
  helpRequestId: string,
): Promise<void> {
  await db
    .update(helpRequests)
    .set({
      responsesCount: sql`GREATEST(0, ${helpRequests.responsesCount} - 1)`,
      updatedAt: new Date(),
    })
    .where(eq(helpRequests.id, helpRequestId));
}

export async function decrementSubjectPostsCountIfNeeded(
  db: AppDatabase,
  subjectId: string | null,
): Promise<void> {
  if (!subjectId) return;
  await db
    .update(subjects)
    .set({
      postsCount: sql`GREATEST(0, ${subjects.postsCount} - 1)`,
      updatedAt: new Date(),
    })
    .where(eq(subjects.id, subjectId));
}
