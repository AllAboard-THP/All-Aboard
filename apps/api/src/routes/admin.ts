import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { count, desc, eq, inArray } from "drizzle-orm";
import type {
  AdminDashboardResponse,
  AdminDenylistPatternsResponse,
  AdminModerationResponse,
  AdminSubjectRequestsResponse,
  AdminUsersResponse,
  CreateDenylistPatternResponse,
  UpdateAdminSubjectRequestResponse,
  UpdateDenylistPatternResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  denylistPatterns,
  helpRequests,
  resources,
  responses,
  subjectRequests,
  subjects,
  users,
} from "../db/schema.js";
import {
  getJwtUser,
  isAdminRole,
  roleFromJwtClaims,
} from "../lib/auth-helpers.js";
import { loadHelpRequestRow } from "../lib/help-request-query.js";
import {
  rowToDenylistPattern,
  rowToHelpRequest,
  rowToResponse,
  rowToSubjectRequest,
} from "../lib/mappers.js";
import {
  adminSubjectRequestPatchSchema,
  createDenylistPatternBodySchema,
  promoteAdminBodySchema,
} from "../lib/schemas.js";
import {
  decrementResponsesCount,
  decrementSubjectPostsCountIfNeeded,
} from "../services/admin-moderation.js";
import { isValidRegexPattern } from "../services/profanity.js";

function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): { sub: string; role: "admin" } | null {
  const jwtUser = getJwtUser(request);
  const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
  if (!isAdminRole(role)) {
    void reply.code(403).send({ error: "forbidden" });
    return null;
  }
  return { sub: jwtUser.sub, role: "admin" };
}

export function registerAdminRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  const adminPre = { preHandler: [app.authenticate] };

  app.get(
    "/admin/dashboard",
    adminPre,
    async (request, reply): Promise<AdminDashboardResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const [usersRow] = await db.select({ value: count() }).from(users);
      const [postsRow] = await db.select({ value: count() }).from(helpRequests);
      const [flaggedPostsRow] = await db
        .select({ value: count() })
        .from(helpRequests)
        .where(eq(helpRequests.flaggedForModeration, true));
      const [flaggedResponsesRow] = await db
        .select({ value: count() })
        .from(responses)
        .where(eq(responses.flaggedForModeration, true));
      const [pendingSubjectRow] = await db
        .select({ value: count() })
        .from(subjectRequests)
        .where(eq(subjectRequests.status, "pending"));
      const [pendingResourcesRow] = await db
        .select({ value: count() })
        .from(resources)
        .where(eq(resources.status, "pending"));

      const recentRows = await db
        .select({
          helpRequest: helpRequests,
          subject: subjects,
        })
        .from(helpRequests)
        .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
        .where(eq(helpRequests.flaggedForModeration, false))
        .orderBy(desc(helpRequests.createdAt))
        .limit(10);

      return {
        stats: {
          totalUsers: Number(usersRow?.value ?? 0),
          totalHelpRequests: Number(postsRow?.value ?? 0),
          flaggedCount:
            Number(flaggedPostsRow?.value ?? 0) +
            Number(flaggedResponsesRow?.value ?? 0),
          pendingSubjectRequests: Number(pendingSubjectRow?.value ?? 0),
          pendingResources: Number(pendingResourcesRow?.value ?? 0),
        },
        recentHelpRequests: recentRows.map(({ helpRequest, subject }) =>
          rowToHelpRequest(helpRequest, subject),
        ),
      };
    },
  );

  app.get(
    "/admin/moderation",
    adminPre,
    async (request, reply): Promise<AdminModerationResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const flaggedHelpRows = await db
        .select({
          helpRequest: helpRequests,
          subject: subjects,
        })
        .from(helpRequests)
        .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
        .where(eq(helpRequests.flaggedForModeration, true))
        .orderBy(desc(helpRequests.createdAt));

      const flaggedResponseRows = await db
        .select()
        .from(responses)
        .where(eq(responses.flaggedForModeration, true))
        .orderBy(desc(responses.createdAt));

      const helpRequestIds = [
        ...new Set(flaggedResponseRows.map((r) => r.helpRequestId)),
      ];
      const helpRequestById = new Map<
        string,
        ReturnType<typeof rowToHelpRequest>
      >();
      if (helpRequestIds.length > 0) {
        const parentRows = await db
          .select({
            helpRequest: helpRequests,
            subject: subjects,
          })
          .from(helpRequests)
          .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
          .where(inArray(helpRequests.id, helpRequestIds));
        for (const row of parentRows) {
          helpRequestById.set(
            row.helpRequest.id,
            rowToHelpRequest(row.helpRequest, row.subject),
          );
        }
      }

      return {
        flaggedHelpRequests: flaggedHelpRows.map(({ helpRequest, subject }) =>
          rowToHelpRequest(helpRequest, subject),
        ),
        flaggedResponses: flaggedResponseRows.map((row) => ({
          item: rowToResponse(row),
          helpRequest: helpRequestById.get(row.helpRequestId),
        })),
      };
    },
  );

  app.post(
    "/admin/moderation/help-requests/:id/approve",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const loaded = await loadHelpRequestRow(db, id);
      if (!loaded?.helpRequest.flaggedForModeration) {
        return reply.code(404).send({ error: "not_found" });
      }

      await db
        .update(helpRequests)
        .set({ flaggedForModeration: false, updatedAt: new Date() })
        .where(eq(helpRequests.id, id));

      const reloaded = await loadHelpRequestRow(db, id);
      return {
        item: rowToHelpRequest(reloaded!.helpRequest, reloaded!.subject),
      };
    },
  );

  app.post(
    "/admin/moderation/help-requests/:id/reject",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const loaded = await loadHelpRequestRow(db, id);
      if (!loaded?.helpRequest.flaggedForModeration) {
        return reply.code(404).send({ error: "not_found" });
      }

      await db.delete(helpRequests).where(eq(helpRequests.id, id));
      await decrementSubjectPostsCountIfNeeded(
        db,
        loaded.helpRequest.subjectId,
      );
      void reply.code(204);
      return;
    },
  );

  app.post(
    "/admin/moderation/responses/:id/approve",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const rows = await db
        .select()
        .from(responses)
        .where(eq(responses.id, id))
        .limit(1);
      const row = rows[0];
      if (!row?.flaggedForModeration) {
        return reply.code(404).send({ error: "not_found" });
      }

      const [updated] = await db
        .update(responses)
        .set({ flaggedForModeration: false })
        .where(eq(responses.id, id))
        .returning();

      return { item: rowToResponse(updated!) };
    },
  );

  app.post(
    "/admin/moderation/responses/:id/reject",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const rows = await db
        .select()
        .from(responses)
        .where(eq(responses.id, id))
        .limit(1);
      const row = rows[0];
      if (!row?.flaggedForModeration) {
        return reply.code(404).send({ error: "not_found" });
      }

      await db.delete(responses).where(eq(responses.id, id));
      await decrementResponsesCount(db, row.helpRequestId);
      void reply.code(204);
      return;
    },
  );

  app.get(
    "/admin/denylist-patterns",
    adminPre,
    async (request, reply): Promise<AdminDenylistPatternsResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const rows = await db
        .select()
        .from(denylistPatterns)
        .orderBy(desc(denylistPatterns.createdAt));

      return { items: rows.map(rowToDenylistPattern) };
    },
  );

  app.post(
    "/admin/denylist-patterns",
    adminPre,
    async (request, reply): Promise<CreateDenylistPatternResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const parsed = createDenylistPatternBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (!isValidRegexPattern(parsed.data.pattern)) {
        return reply.code(400).send({ error: "invalid_regex" });
      }

      const now = new Date();
      const [inserted] = await db
        .insert(denylistPatterns)
        .values({
          label: parsed.data.label.trim(),
          pattern: parsed.data.pattern.trim(),
          active: parsed.data.active ?? true,
          updatedAt: now,
        })
        .returning();

      void reply.code(201);
      return { item: rowToDenylistPattern(inserted!) };
    },
  );

  app.patch(
    "/admin/denylist-patterns/:id",
    adminPre,
    async (request, reply): Promise<UpdateDenylistPatternResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const body = request.body as { active?: boolean };
      if (typeof body?.active !== "boolean") {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const [updated] = await db
        .update(denylistPatterns)
        .set({ active: body.active, updatedAt: new Date() })
        .where(eq(denylistPatterns.id, id))
        .returning();

      if (!updated) {
        return reply.code(404).send({ error: "not_found" });
      }

      return { item: rowToDenylistPattern(updated) };
    },
  );

  app.delete(
    "/admin/denylist-patterns/:id",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const deleted = await db
        .delete(denylistPatterns)
        .where(eq(denylistPatterns.id, id))
        .returning({ id: denylistPatterns.id });
      if (deleted.length === 0) {
        return reply.code(404).send({ error: "not_found" });
      }
      void reply.code(204);
      return;
    },
  );

  app.get(
    "/admin/users",
    adminPre,
    async (request, reply): Promise<AdminUsersResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          fullName: users.fullName,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(users.createdAt);

      return {
        items: rows.map((row) => ({
          id: row.id,
          email: row.email,
          role: row.role,
          displayName: row.fullName?.trim() || row.email.split("@")[0] || row.email,
          createdAt: row.createdAt.toISOString(),
        })),
      };
    },
  );

  app.post(
    "/admin/users/:id/promote-admin",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const parsed = promoteAdminBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const { id } = request.params as { id: string };
      const newRole = parsed.data.admin ? ("admin" as const) : ("student" as const);
      const [updated] = await db
        .update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          fullName: users.fullName,
          createdAt: users.createdAt,
        });

      if (!updated) {
        return reply.code(404).send({ error: "not_found" });
      }

      return {
        item: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          displayName:
            updated.fullName?.trim() ||
            updated.email.split("@")[0] ||
            updated.email,
          createdAt: updated.createdAt.toISOString(),
        },
      };
    },
  );

  app.post(
    "/admin/users/:id/promote-mentor",
    adminPre,
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const { id } = request.params as { id: string };
      const rows = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      const current = rows[0];
      if (!current) {
        return reply.code(404).send({ error: "not_found" });
      }
      if (current.role === "admin") {
        return reply.code(400).send({ error: "cannot_change_admin_role" });
      }

      const newRole = current.role === "mentor" ? "student" : "mentor";
      const [updated] = await db
        .update(users)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          fullName: users.fullName,
          createdAt: users.createdAt,
        });

      return {
        item: {
          id: updated!.id,
          email: updated!.email,
          role: updated!.role,
          displayName:
            updated!.fullName?.trim() ||
            updated!.email.split("@")[0] ||
            updated!.email,
          createdAt: updated!.createdAt.toISOString(),
        },
      };
    },
  );

  app.get(
    "/admin/subject-requests",
    adminPre,
    async (request, reply): Promise<AdminSubjectRequestsResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const rows = await db
        .select({
          subjectRequest: subjectRequests,
          userEmail: users.email,
          userFullName: users.fullName,
        })
        .from(subjectRequests)
        .innerJoin(users, eq(subjectRequests.userId, users.id))
        .orderBy(desc(subjectRequests.createdAt));

      const group = (
        status: "pending" | "approved" | "rejected",
      ): AdminSubjectRequestsResponse["pending"] =>
        rows
          .filter((r) => r.subjectRequest.status === status)
          .map((r) => ({
            ...rowToSubjectRequest(r.subjectRequest),
            authorId: r.subjectRequest.userId,
            authorEmail: r.userEmail,
            authorDisplayName:
              r.userFullName?.trim() ||
              r.userEmail.split("@")[0] ||
              r.userEmail,
          }));

      return {
        pending: group("pending"),
        approved: group("approved"),
        rejected: group("rejected"),
      };
    },
  );

  app.patch(
    "/admin/subject-requests/:id",
    adminPre,
    async (
      request,
      reply,
    ): Promise<UpdateAdminSubjectRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      if (!requireAdmin(request, reply)) return;

      const parsed = adminSubjectRequestPatchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const { id } = request.params as { id: string };
      const [updated] = await db
        .update(subjectRequests)
        .set({
          status: parsed.data.status,
          updatedAt: new Date(),
        })
        .where(eq(subjectRequests.id, id))
        .returning();

      if (!updated) {
        return reply.code(404).send({ error: "not_found" });
      }

      const userRows = await db
        .select({
          email: users.email,
          fullName: users.fullName,
        })
        .from(users)
        .where(eq(users.id, updated.userId))
        .limit(1);
      const user = userRows[0];

      return {
        item: {
          ...rowToSubjectRequest(updated),
          authorId: updated.userId,
          ...(user
            ? {
                authorEmail: user.email,
                authorDisplayName:
                  user.fullName?.trim() ||
                  user.email.split("@")[0] ||
                  user.email,
              }
            : {}),
        },
      };
    },
  );
}
