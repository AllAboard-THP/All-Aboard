import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, subjects } from "../db/schema.js";
import type { FeedQueryParams } from "./schemas.js";

/** Contenu masqué du fil public tant que la modération n'a pas approuvé (Rails feed). */
export const feedPublicVisibility = eq(helpRequests.flaggedForModeration, false);

export function buildFeedConditions(params: FeedQueryParams): SQL | undefined {
  const conditions: SQL[] = [feedPublicVisibility];

  if (params.tag) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM unnest(${helpRequests.tags}) AS t
        WHERE lower(trim(t)) = ${params.tag}
      )`,
    );
  }

  if (params.q) {
    const pattern = `%${params.q}%`;
    conditions.push(
      or(
        ilike(helpRequests.title, pattern),
        ilike(helpRequests.body, pattern),
      )!,
    );
  }

  return and(...conditions);
}

export async function resolveSubjectIdBySlug(
  db: AppDatabase,
  slug: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

export async function countFeedItems(
  db: AppDatabase,
  params: FeedQueryParams,
  subjectId?: string | null,
): Promise<number> {
  const conditions = buildFeedConditions(params);
  const subjectCond = subjectId
    ? eq(helpRequests.subjectId, subjectId)
    : undefined;
  const where = subjectCond ? and(conditions, subjectCond) : conditions;

  const query = db.select({ value: count() }).from(helpRequests);
  const rows = where ? await query.where(where) : await query;
  return Number(rows[0]?.value ?? 0);
}

export async function fetchFeedRows(
  db: AppDatabase,
  params: FeedQueryParams,
  subjectId?: string | null,
) {
  const conditions = buildFeedConditions(params);
  const subjectCond = subjectId
    ? eq(helpRequests.subjectId, subjectId)
    : undefined;
  const where = subjectCond ? and(conditions, subjectCond) : conditions;

  const base = db
    .select({
      helpRequest: helpRequests,
      subject: subjects,
    })
    .from(helpRequests)
    .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
    .orderBy(desc(helpRequests.createdAt))
    .limit(params.limit)
    .offset(params.offset);

  return where ? base.where(where) : base;
}

export async function fetchUnansweredRows(db: AppDatabase, limit = 5) {
  return db
    .select({
      helpRequest: helpRequests,
      subject: subjects,
    })
    .from(helpRequests)
    .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
    .where(
      and(
        feedPublicVisibility,
        eq(helpRequests.status, "open"),
        eq(helpRequests.responsesCount, 0),
      ),
    )
    .orderBy(desc(helpRequests.createdAt))
    .limit(limit);
}

export const mentorFeedWhere = sql`(
  cardinality(${helpRequests.tags}) > 0
  OR ${helpRequests.mentorHelpRequested} = true
)`;
