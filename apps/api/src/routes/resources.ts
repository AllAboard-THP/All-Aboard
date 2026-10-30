import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import type {
  CreateResourceResponse,
  ResourceDetailResponse,
  ResourcesListResponse,
  UpdateResourceResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { resources, subjects } from "../db/schema.js";
import {
  getJwtUser,
  roleFromJwtClaims,
} from "../lib/auth-helpers.js";
import {
  countPublishedResources,
  fetchPublishedResourceRows,
} from "../lib/resources-query.js";
import {
  createResourceBodySchema,
  parseResourcesListQuery,
  updateResourceBodySchema,
} from "../lib/schemas.js";
import {
  loadMentorSubjectIds,
  subjectInMentorScope,
} from "../services/mentor-scope.js";
import {
  loadResourceBundle,
  mapResourceBundles,
  mapResourceRow,
  syncResourceTags,
} from "../services/resources.js";
import { loadUserFromJwtSub } from "../services/user-profile.js";

async function subjectExists(
  db: AppDatabase,
  subjectId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .limit(1);
  return rows.length > 0;
}

function initialResourceStatus(role: ReturnType<typeof roleFromJwtClaims>) {
  return role === "mentor" || role === "admin" ? "published" : "pending";
}

async function canViewResource(
  db: AppDatabase,
  bundle: NonNullable<Awaited<ReturnType<typeof loadResourceBundle>>>,
  viewerEmail: string | null,
  viewerRole: ReturnType<typeof roleFromJwtClaims> | null,
  viewerUserId: string | null,
): Promise<boolean> {
  if (bundle.resource.status === "published") return true;
  if (!viewerEmail) return false;
  if (viewerRole === "admin") return true;
  if (bundle.author?.email === viewerEmail) return true;
  if (
    viewerRole === "mentor" &&
    bundle.resource.status === "pending" &&
    viewerUserId &&
    bundle.resource.subjectId
  ) {
    const mentorSubjectIds = await loadMentorSubjectIds(db, viewerUserId);
    return subjectInMentorScope(bundle.resource.subjectId, mentorSubjectIds);
  }
  return false;
}

export function registerResourceRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get(
    "/resources",
    async (request, reply): Promise<ResourcesListResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const params = parseResourcesListQuery(
        request.query as Record<string, unknown>,
      );
      const total = await countPublishedResources(db, params);
      const rows = await fetchPublishedResourceRows(db, params);
      const items = await mapResourceBundles(
        db,
        rows.map((r) => ({
          resource: r.resource,
          subject: r.subject,
          author: r.author,
        })),
      );

      return {
        items,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
        },
      };
    },
  );

  app.post(
    "/resources",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateResourceResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createResourceBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const user = await loadUserFromJwtSub(db, jwtUser.sub);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      if (!(await subjectExists(db, parsed.data.subjectId))) {
        return reply.code(400).send({ error: "invalid_subject" });
      }

      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      const status = initialResourceStatus(role);

      const [inserted] = await db
        .insert(resources)
        .values({
          title: parsed.data.title.trim(),
          body: parsed.data.body.trim(),
          userId: user.id,
          subjectId: parsed.data.subjectId,
          status,
        })
        .returning();

      const tags = await syncResourceTags(db, inserted!.id, parsed.data.tags);
      const bundle = await loadResourceBundle(db, inserted!.id);
      if (!bundle) {
        return reply.code(500).send({ error: "create_failed" });
      }

      return reply.code(201).send({
        item: mapResourceRow(
          bundle.resource,
          bundle.subject,
          bundle.author,
          tags,
        ),
      });
    },
  );

  app.get(
    "/resources/:id",
    async (request, reply): Promise<ResourceDetailResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const bundle = await loadResourceBundle(db, id);
      if (!bundle) {
        return reply.code(404).send({ error: "not_found" });
      }

      let viewerEmail: string | null = null;
      let viewerRole: ReturnType<typeof roleFromJwtClaims> | null = null;
      let viewerUserId: string | null = null;
      try {
        await request.jwtVerify();
        const jwtUser = getJwtUser(request);
        viewerEmail = jwtUser.sub;
        viewerRole = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
        const user = await loadUserFromJwtSub(db, jwtUser.sub);
        viewerUserId = user?.id ?? null;
      } catch {
        // public access for published only
      }

      const allowed = await canViewResource(
        db,
        bundle,
        viewerEmail,
        viewerRole,
        viewerUserId,
      );
      if (!allowed) {
        return reply.code(404).send({ error: "not_found" });
      }

      return {
        item: mapResourceRow(
          bundle.resource,
          bundle.subject,
          bundle.author,
          bundle.tags,
        ),
      };
    },
  );

  app.patch(
    "/resources/:id",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<UpdateResourceResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = updateResourceBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const { id } = request.params as { id: string };
      const bundle = await loadResourceBundle(db, id);
      if (!bundle) {
        return reply.code(404).send({ error: "not_found" });
      }

      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      const dbUser = await loadUserFromJwtSub(db, jwtUser.sub);
      const isOwner = Boolean(
        dbUser && bundle.author?.email === dbUser.email,
      );
      if (!isOwner && role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }

      if (
        parsed.data.subjectId !== undefined &&
        parsed.data.subjectId !== null &&
        !(await subjectExists(db, parsed.data.subjectId))
      ) {
        return reply.code(400).send({ error: "invalid_subject" });
      }

      const patch: Partial<typeof resources.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (parsed.data.title !== undefined) {
        patch.title = parsed.data.title.trim();
      }
      if (parsed.data.body !== undefined) {
        patch.body = parsed.data.body.trim();
      }
      if (parsed.data.subjectId !== undefined) {
        patch.subjectId = parsed.data.subjectId;
      }

      await db.update(resources).set(patch).where(eq(resources.id, id));

      if (parsed.data.tags !== undefined) {
        await syncResourceTags(db, id, parsed.data.tags);
      }

      const updated = await loadResourceBundle(db, id);
      if (!updated) {
        return reply.code(500).send({ error: "update_failed" });
      }

      return {
        item: mapResourceRow(
          updated.resource,
          updated.subject,
          updated.author,
          updated.tags,
        ),
      };
    },
  );

  app.delete(
    "/resources/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const bundle = await loadResourceBundle(db, id);
      if (!bundle) {
        return reply.code(404).send({ error: "not_found" });
      }

      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      const dbUser = await loadUserFromJwtSub(db, jwtUser.sub);
      const isOwner = Boolean(
        dbUser && bundle.author?.email === dbUser.email,
      );
      if (!isOwner && role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }

      await db.delete(resources).where(eq(resources.id, id));
      return reply.code(204).send();
    },
  );
}
