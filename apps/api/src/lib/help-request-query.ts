import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import type { HelpRequest } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { bookmarks, helpRequests, subjects } from "../db/schema.js";
import { rowToHelpRequest } from "./mappers.js";

export async function loadHelpRequestRow(db: AppDatabase, id: string) {
  const rows = await db
    .select({
      helpRequest: helpRequests,
      subject: subjects,
    })
    .from(helpRequests)
    .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
    .where(eq(helpRequests.id, id))
    .limit(1);
  return rows[0];
}

export async function fetchHelpRequestsForAuthor(
  db: AppDatabase,
  authorKeys: string | string[],
  limit = 100,
): Promise<HelpRequest[]> {
  const keys = Array.isArray(authorKeys) ? authorKeys : [authorKeys];
  const rows = await db
    .select({
      helpRequest: helpRequests,
      subject: subjects,
    })
    .from(helpRequests)
    .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
    .where(inArray(helpRequests.authorId, keys))
    .orderBy(desc(helpRequests.createdAt))
    .limit(limit);
  return rows.map(({ helpRequest, subject }) =>
    rowToHelpRequest(helpRequest, subject),
  );
}

export async function fetchBookmarkedHelpRequests(
  db: AppDatabase,
  userKeys: string | string[],
  limit = 100,
): Promise<HelpRequest[]> {
  const keys = Array.isArray(userKeys) ? userKeys : [userKeys];
  const rows = await db
    .select({
      helpRequest: helpRequests,
      subject: subjects,
    })
    .from(bookmarks)
    .innerJoin(helpRequests, eq(bookmarks.helpRequestId, helpRequests.id))
    .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
    .where(
      and(inArray(bookmarks.userId, keys), isNull(helpRequests.deletedAt)),
    )
    .orderBy(desc(bookmarks.createdAt))
    .limit(limit);
  return rows.map(({ helpRequest, subject }) =>
    rowToHelpRequest(helpRequest, subject),
  );
}

export async function helpRequestExists(
  db: AppDatabase,
  id: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: helpRequests.id })
    .from(helpRequests)
    .where(eq(helpRequests.id, id))
    .limit(1);
  return rows.length > 0;
}
