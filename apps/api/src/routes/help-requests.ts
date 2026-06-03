import type { FastifyInstance } from "fastify";
import { eq, inArray, sql } from "drizzle-orm";
import type {
  CreateHelpRequestResponse,
  CreateResponseResponse,
  HelpRequestDetailResponse,
  UpdateHelpRequestResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, responses, subjects, users } from "../db/schema.js";
import type { EvaluateRoutingFn } from "../agent/routing.js";
import { enqueueHelpRequestCreated } from "../intuition/outbox.js";
import {
  getJwtUser,
  normalizeTitle,
  responseVisibleUnderCertificationFilter,
  roleFromJwtClaims,
} from "../lib/auth-helpers.js";
import { rowToHelpRequest, rowToResponse } from "../lib/mappers.js";
import {
  createHelpRequestBodySchema,
  createResponseBodySchema,
  updateHelpRequestBodySchema,
} from "../lib/schemas.js";

async function loadHelpRequestRow(db: AppDatabase, id: string) {
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

async function adjustSubjectPostsCount(
  db: AppDatabase,
  subjectId: string | null | undefined,
  delta: number,
): Promise<void> {
  if (!subjectId || delta === 0) return;
  await db
    .update(subjects)
    .set({
      postsCount: sql`GREATEST(0, ${subjects.postsCount} + ${delta})`,
      updatedAt: new Date(),
    })
    .where(eq(subjects.id, subjectId));
}

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

export function registerHelpRequestRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
  evaluateRouting: EvaluateRoutingFn,
) {
  app.get(
    "/help-requests/:id",
    async (request, reply): Promise<HelpRequestDetailResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const query = request.query as { filterByCertifications?: string };
      const filterByCertifications = query.filterByCertifications === "true";

      if (filterByCertifications) {
        try {
          await request.jwtVerify();
        } catch {
          return reply.code(401).send({ error: "unauthorized" });
        }
        const user = getJwtUser(request);
        const role = roleFromJwtClaims(user.sub, user.role);
        if (role !== "mentor") {
          return reply.code(403).send({ error: "forbidden" });
        }
      }

      const { id } = request.params as { id: string };
      const loaded = await loadHelpRequestRow(db, id);
      if (!loaded) {
        return reply.code(404).send({ error: "not_found" });
      }

      const responseRows = await db
        .select()
        .from(responses)
        .where(eq(responses.helpRequestId, id))
        .orderBy(responses.createdAt);

      let visibleRows = responseRows;
      if (filterByCertifications) {
        const authorEmails = [...new Set(responseRows.map((r) => r.authorId))];
        const certByEmail = new Map<string, string[]>();
        if (authorEmails.length > 0) {
          const userRows = await db
            .select({
              email: users.email,
              certificationTags: users.certificationTags,
            })
            .from(users)
            .where(inArray(users.email, authorEmails));
          for (const u of userRows) {
            certByEmail.set(u.email, u.certificationTags ?? []);
          }
        }
        const requestTags = loaded.helpRequest.tags ?? [];
        visibleRows = responseRows.filter((r) =>
          responseVisibleUnderCertificationFilter(
            r.authorId,
            loaded.helpRequest.authorId,
            requestTags,
            certByEmail.get(r.authorId) ?? [],
          ),
        );
      }

      return {
        item: rowToHelpRequest(loaded.helpRequest, loaded.subject),
        responses: visibleRows.map(rowToResponse),
        ...(filterByCertifications
          ? {
              certificationFilter: {
                applied: true as const,
                totalCount: responseRows.length,
                visibleCount: visibleRows.length,
              },
            }
          : {}),
      };
    },
  );

  app.post(
    "/help-requests",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateHelpRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createHelpRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const user = getJwtUser(request);
      const norm = normalizeTitle(parsed.data.title);
      const dup = await db
        .select({ id: helpRequests.id })
        .from(helpRequests)
        .where(
          sql`regexp_replace(lower(trim(${helpRequests.title})), '[[:space:]]+', ' ', 'g') = ${norm}`,
        )
        .limit(1);
      if (dup.length > 0) {
        return reply
          .code(409)
          .send({ error: "duplicate", existingId: dup[0]!.id });
      }

      if (parsed.data.subjectId) {
        const exists = await subjectExists(db, parsed.data.subjectId);
        if (!exists) {
          return reply.code(400).send({ error: "invalid_subject" });
        }
      }

      const tags = parsed.data.tags ?? [];
      const now = new Date();
      const inserted = await db
        .insert(helpRequests)
        .values({
          title: parsed.data.title.trim(),
          body: parsed.data.body?.trim() ?? "",
          authorId: user.sub,
          tags,
          codeSnippet: parsed.data.codeSnippet,
          codeLanguage: parsed.data.codeLanguage ?? "plaintext",
          urgent: parsed.data.urgent ?? false,
          subjectId: parsed.data.subjectId,
          educationLevel: parsed.data.educationLevel,
          updatedAt: now,
        })
        .returning();
      const row = inserted[0];
      if (!row) {
        return reply.code(500).send({ error: "insert_failed" });
      }

      if (parsed.data.subjectId) {
        await adjustSubjectPostsCount(db, parsed.data.subjectId, 1);
      }

      await enqueueHelpRequestCreated(db, {
        id: row.id,
        title: row.title,
        authorId: row.authorId,
        tags: row.tags?.length ? row.tags : undefined,
      });

      const item = rowToHelpRequest(row);
      const routing = await evaluateRouting({
        title: parsed.data.title.trim(),
        ...(tags.length ? { tags } : {}),
        authorId: user.sub,
      });
      const hints = routing.suggestRubberduckRedirect
        ? { rubberduckEligible: true as const }
        : undefined;
      void reply.code(201);
      return hints ? { item, hints } : { item };
    },
  );

  app.patch(
    "/help-requests/:id",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<UpdateHelpRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = updateHelpRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const { id } = request.params as { id: string };
      const user = getJwtUser(request);
      const loaded = await loadHelpRequestRow(db, id);
      if (!loaded) {
        return reply.code(404).send({ error: "not_found" });
      }
      if (loaded.helpRequest.authorId !== user.sub) {
        return reply.code(403).send({ error: "forbidden" });
      }

      if (parsed.data.subjectId) {
        const exists = await subjectExists(db, parsed.data.subjectId);
        if (!exists) {
          return reply.code(400).send({ error: "invalid_subject" });
        }
      }

      const oldSubjectId = loaded.helpRequest.subjectId;
      const newSubjectId =
        parsed.data.subjectId === null
          ? null
          : (parsed.data.subjectId ?? oldSubjectId);

      const updated = await db
        .update(helpRequests)
        .set({
          ...(parsed.data.title !== undefined
            ? { title: parsed.data.title.trim() }
            : {}),
          ...(parsed.data.body !== undefined
            ? { body: parsed.data.body.trim() }
            : {}),
          ...(parsed.data.codeSnippet !== undefined
            ? { codeSnippet: parsed.data.codeSnippet }
            : {}),
          ...(parsed.data.codeLanguage !== undefined
            ? { codeLanguage: parsed.data.codeLanguage }
            : {}),
          ...(parsed.data.tags !== undefined ? { tags: parsed.data.tags } : {}),
          ...(parsed.data.urgent !== undefined
            ? { urgent: parsed.data.urgent }
            : {}),
          ...(parsed.data.status !== undefined
            ? { status: parsed.data.status }
            : {}),
          ...(parsed.data.educationLevel !== undefined
            ? { educationLevel: parsed.data.educationLevel }
            : {}),
          ...(parsed.data.subjectId !== undefined
            ? { subjectId: parsed.data.subjectId }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(helpRequests.id, id))
        .returning();

      const row = updated[0];
      if (!row) {
        return reply.code(500).send({ error: "update_failed" });
      }

      if (parsed.data.subjectId !== undefined && oldSubjectId !== newSubjectId) {
        await adjustSubjectPostsCount(db, oldSubjectId, -1);
        await adjustSubjectPostsCount(db, newSubjectId, 1);
      }

      const reloaded = await loadHelpRequestRow(db, id);
      return {
        item: rowToHelpRequest(
          reloaded!.helpRequest,
          reloaded!.subject,
        ),
      };
    },
  );

  app.post(
    "/help-requests/:id/help-mentor",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<UpdateHelpRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const user = getJwtUser(request);
      const loaded = await loadHelpRequestRow(db, id);
      if (!loaded) {
        return reply.code(404).send({ error: "not_found" });
      }
      if (loaded.helpRequest.authorId !== user.sub) {
        return reply.code(403).send({ error: "forbidden" });
      }

      const updated = await db
        .update(helpRequests)
        .set({
          mentorHelpRequested: true,
          updatedAt: new Date(),
        })
        .where(eq(helpRequests.id, id))
        .returning();
      const row = updated[0];
      if (!row) {
        return reply.code(500).send({ error: "update_failed" });
      }

      const reloaded = await loadHelpRequestRow(db, id);
      void reply.code(200);
      return {
        item: rowToHelpRequest(
          reloaded!.helpRequest,
          reloaded!.subject,
        ),
      };
    },
  );

  app.post(
    "/help-requests/:id/responses",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateResponseResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const parsed = createResponseBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const helpRows = await db
        .select({ id: helpRequests.id })
        .from(helpRequests)
        .where(eq(helpRequests.id, id))
        .limit(1);
      if (helpRows.length === 0) {
        return reply.code(404).send({ error: "not_found" });
      }
      const user = getJwtUser(request);
      const inserted = await db
        .insert(responses)
        .values({
          helpRequestId: id,
          body: parsed.data.body.trim(),
          authorId: user.sub,
          codeSnippet: parsed.data.codeSnippet,
          codeLanguage: parsed.data.codeLanguage,
        })
        .returning();
      const row = inserted[0];
      if (!row) {
        return reply.code(500).send({ error: "insert_failed" });
      }

      await db
        .update(helpRequests)
        .set({
          responsesCount: sql`${helpRequests.responsesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(helpRequests.id, id));

      void reply.code(201);
      return { item: rowToResponse(row) };
    },
  );
}
