import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { resources, subjects, users } from "../db/schema.js";
import type { ResourcesListQueryParams } from "./schemas.js";

export function publishedResourcesWhere(): SQL {
  return eq(resources.status, "published");
}

export function buildResourcesSearchCondition(q: string): SQL {
  const pattern = `%${q}%`;
  return or(
    ilike(resources.title, pattern),
    ilike(resources.body, pattern),
    ilike(subjects.name, pattern),
    sql`EXISTS (
      SELECT 1 FROM resource_tags rt
      WHERE rt.resource_id = ${resources.id}
        AND rt.tag ILIKE ${pattern}
    )`,
  )!;
}

export async function countPublishedResources(
  db: AppDatabase,
  params: ResourcesListQueryParams,
): Promise<number> {
  const conditions: SQL[] = [publishedResourcesWhere()];
  if (params.q) {
    conditions.push(buildResourcesSearchCondition(params.q));
  }
  const where = and(...conditions);

  const query = db
    .select({ value: count() })
    .from(resources)
    .leftJoin(subjects, eq(resources.subjectId, subjects.id));

  const rows = await query.where(where);
  return Number(rows[0]?.value ?? 0);
}

export async function fetchPublishedResourceRows(
  db: AppDatabase,
  params: ResourcesListQueryParams,
) {
  const conditions: SQL[] = [publishedResourcesWhere()];
  if (params.q) {
    conditions.push(buildResourcesSearchCondition(params.q));
  }
  const where = and(...conditions);

  return db
    .select({
      resource: resources,
      subject: subjects,
      author: users,
    })
    .from(resources)
    .leftJoin(subjects, eq(resources.subjectId, subjects.id))
    .innerJoin(users, eq(resources.userId, users.id))
    .where(where)
    .orderBy(desc(resources.createdAt))
    .limit(params.limit)
    .offset(params.offset);
}
