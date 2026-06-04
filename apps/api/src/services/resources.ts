import { eq, inArray } from "drizzle-orm";
import type { Resource } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  resourceTags,
  resources,
  subjects,
  users,
} from "../db/schema.js";
import { normalizeTag } from "../lib/auth-helpers.js";
import { rowToResource } from "../lib/mappers.js";

type ResourceRow = typeof resources.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;
type UserRow = typeof users.$inferSelect;

export async function loadResourceTags(
  db: AppDatabase,
  resourceIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (resourceIds.length === 0) return map;

  const rows = await db
    .select()
    .from(resourceTags)
    .where(inArray(resourceTags.resourceId, resourceIds));

  for (const row of rows) {
    const list = map.get(row.resourceId) ?? [];
    list.push(row.tag);
    map.set(row.resourceId, list);
  }
  return map;
}

export async function syncResourceTags(
  db: AppDatabase,
  resourceId: string,
  tags: string[] | undefined,
): Promise<string[]> {
  await db.delete(resourceTags).where(eq(resourceTags.resourceId, resourceId));
  if (!tags?.length) return [];

  const normalized = [
    ...new Set(tags.map(normalizeTag).filter((t) => t.length > 0)),
  ];
  if (normalized.length > 0) {
    await db.insert(resourceTags).values(
      normalized.map((tag) => ({ resourceId, tag })),
    );
  }
  return normalized;
}

export function mapResourceRow(
  row: ResourceRow,
  subject: SubjectRow | null | undefined,
  author: UserRow | null | undefined,
  tags: string[],
): Resource {
  return rowToResource(row, subject, author?.email, tags);
}

export async function loadResourceBundle(
  db: AppDatabase,
  resourceId: string,
): Promise<{
  resource: ResourceRow;
  subject: SubjectRow | null;
  author: UserRow | null;
  tags: string[];
} | null> {
  const rows = await db
    .select({
      resource: resources,
      subject: subjects,
      author: users,
    })
    .from(resources)
    .leftJoin(subjects, eq(resources.subjectId, subjects.id))
    .leftJoin(users, eq(resources.userId, users.id))
    .where(eq(resources.id, resourceId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const tagMap = await loadResourceTags(db, [resourceId]);
  return {
    resource: row.resource,
    subject: row.subject,
    author: row.author,
    tags: tagMap.get(resourceId) ?? [],
  };
}

export async function mapResourceBundles(
  db: AppDatabase,
  bundles: Array<{
    resource: ResourceRow;
    subject: SubjectRow | null;
    author: UserRow | null;
  }>,
): Promise<Resource[]> {
  const ids = bundles.map((b) => b.resource.id);
  const tagMap = await loadResourceTags(db, ids);
  return bundles.map(({ resource, subject, author }) =>
    mapResourceRow(resource, subject, author, tagMap.get(resource.id) ?? []),
  );
}
