import type { FastifyInstance } from "fastify";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import type {
  ApproveResourceResponse,
  MentorDashboardResponse,
  MentorFeedItem,
  MentorFeedResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  helpRequests,
  resources,
  responses,
  subjects,
  users,
} from "../db/schema.js";
import {
  getJwtUser,
  roleFromJwtClaims,
} from "../lib/auth-helpers.js";
import { mentorFeedWhere } from "../lib/feed-query.js";
import { rowToHelpRequest } from "../lib/mappers.js";
import {
  loadMentorSubjectIds,
  mentorPendingResourcesWhere,
  subjectInMentorScope,
} from "../services/mentor-scope.js";
import {
  loadResourceBundle,
  mapResourceBundles,
  mapResourceRow,
} from "../services/resources.js";
import {
  loadProfileIdsByEmails,
  loadUserByEmail,
} from "../services/user-profile.js";

export function registerMentorRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get(
    "/mentor/feed",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MentorFeedResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const user = getJwtUser(request);
      const role = roleFromJwtClaims(user.sub, user.role);
      if (role !== "mentor") {
        return reply.code(403).send({ error: "forbidden" });
      }
      const mentorId = user.sub;

      const rows = await db
        .select({
          helpRequest: helpRequests,
          subject: subjects,
        })
        .from(helpRequests)
        .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
        .where(mentorFeedWhere)
        .orderBy(desc(helpRequests.createdAt))
        .limit(100);

      const ids = rows.map((row) => row.helpRequest.id);
      const responsesByRequest = new Map<
        string,
        Array<typeof responses.$inferSelect>
      >();

      if (ids.length > 0) {
        const responseRows = await db
          .select()
          .from(responses)
          .where(inArray(responses.helpRequestId, ids))
          .orderBy(responses.createdAt);
        for (const row of responseRows) {
          const list = responsesByRequest.get(row.helpRequestId) ?? [];
          list.push(row);
          responsesByRequest.set(row.helpRequestId, list);
        }
      }

      const profileIdsByEmail = await loadProfileIdsByEmails(
        db,
        rows.map(({ helpRequest }) => helpRequest.authorId),
      );

      const items: MentorFeedItem[] = rows.map(({ helpRequest, subject }) => {
        const base = rowToHelpRequest(
          helpRequest,
          subject,
          profileIdsByEmail.get(helpRequest.authorId.toLowerCase()),
        );
        const requestResponses = responsesByRequest.get(helpRequest.id) ?? [];
        const responseCount = requestResponses.length;
        let lastResponseAt: string | null = null;
        let hasUnreadForMentor = false;
        if (responseCount > 0) {
          const last = requestResponses[responseCount - 1]!;
          lastResponseAt = last.createdAt.toISOString();
          hasUnreadForMentor = last.authorId !== mentorId;
        }
        return {
          ...base,
          responseCount,
          lastResponseAt,
          hasUnreadForMentor,
        };
      });

      return { items };
    },
  );

  app.get(
    "/mentor/dashboard",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MentorDashboardResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      if (role !== "mentor" && role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }

      const user = await loadUserByEmail(db, jwtUser.sub);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const mentorSubjectIds = await loadMentorSubjectIds(db, user.id);

      const [myResourcesCountRow] = await db
        .select({ value: count() })
        .from(resources)
        .where(eq(resources.userId, user.id));

      const pendingWhere = mentorPendingResourcesWhere(mentorSubjectIds);
      const [pendingCountRow] = await db
        .select({ value: count() })
        .from(resources)
        .where(pendingWhere);

      const helpWhere =
        mentorSubjectIds.length > 0
          ? and(
              eq(helpRequests.mentorHelpRequested, true),
              inArray(helpRequests.subjectId, mentorSubjectIds),
            )
          : eq(helpRequests.id, helpRequests.id);

      const [helpCountRow] =
        mentorSubjectIds.length > 0
          ? await db
              .select({ value: count() })
              .from(helpRequests)
              .where(helpWhere)
          : [{ value: 0 }];

      const myResourceRows = await db
        .select({
          resource: resources,
          subject: subjects,
          author: users,
        })
        .from(resources)
        .leftJoin(subjects, eq(resources.subjectId, subjects.id))
        .innerJoin(users, eq(resources.userId, users.id))
        .where(eq(resources.userId, user.id))
        .orderBy(desc(resources.createdAt))
        .limit(20);

      const pendingResourceRows =
        mentorSubjectIds.length > 0
          ? await db
              .select({
                resource: resources,
                subject: subjects,
                author: users,
              })
              .from(resources)
              .leftJoin(subjects, eq(resources.subjectId, subjects.id))
              .innerJoin(users, eq(resources.userId, users.id))
              .where(pendingWhere)
              .orderBy(resources.createdAt)
              .limit(20)
          : [];

      const helpRows =
        mentorSubjectIds.length > 0
          ? await db
              .select({
                helpRequest: helpRequests,
                subject: subjects,
              })
              .from(helpRequests)
              .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
              .where(
                and(
                  eq(helpRequests.mentorHelpRequested, true),
                  inArray(helpRequests.subjectId, mentorSubjectIds),
                ),
              )
              .orderBy(desc(helpRequests.createdAt))
              .limit(20)
          : [];

      const myResources = await mapResourceBundles(db, myResourceRows);
      const pendingResources = await mapResourceBundles(db, pendingResourceRows);
      const helpMentorQueue = helpRows.map(({ helpRequest, subject }) =>
        rowToHelpRequest(helpRequest, subject),
      );

      const response: MentorDashboardResponse = {
        stats: {
          myResourcesCount: Number(myResourcesCountRow?.value ?? 0),
          pendingResourcesCount: Number(pendingCountRow?.value ?? 0),
          helpMentorQueueCount: Number(helpCountRow?.value ?? 0),
        },
        myResources,
        pendingResources,
        helpMentorQueue,
      };

      return response;
    },
  );

  app.post(
    "/mentor/resources/:id/approve",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<ApproveResourceResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      if (role !== "mentor" && role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }

      const user = await loadUserByEmail(db, jwtUser.sub);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const { id } = request.params as { id: string };
      const bundle = await loadResourceBundle(db, id);
      if (!bundle || bundle.resource.status !== "pending") {
        return reply.code(404).send({ error: "not_found" });
      }

      if (role !== "admin") {
        const mentorSubjectIds = await loadMentorSubjectIds(db, user.id);
        if (
          !subjectInMentorScope(bundle.resource.subjectId, mentorSubjectIds)
        ) {
          return reply.code(403).send({ error: "forbidden" });
        }
      }

      await db
        .update(resources)
        .set({ status: "published", updatedAt: new Date() })
        .where(eq(resources.id, id));

      const updated = await loadResourceBundle(db, id);
      if (!updated) {
        return reply.code(500).send({ error: "approve_failed" });
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

  app.post(
    "/mentor/resources/:id/reject",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<ApproveResourceResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const role = roleFromJwtClaims(jwtUser.sub, jwtUser.role);
      if (role !== "mentor" && role !== "admin") {
        return reply.code(403).send({ error: "forbidden" });
      }

      const user = await loadUserByEmail(db, jwtUser.sub);
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const { id } = request.params as { id: string };
      const bundle = await loadResourceBundle(db, id);
      if (!bundle || bundle.resource.status !== "pending") {
        return reply.code(404).send({ error: "not_found" });
      }

      if (role !== "admin") {
        const mentorSubjectIds = await loadMentorSubjectIds(db, user.id);
        if (
          !subjectInMentorScope(bundle.resource.subjectId, mentorSubjectIds)
        ) {
          return reply.code(403).send({ error: "forbidden" });
        }
      }

      await db
        .update(resources)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(resources.id, id));

      const updated = await loadResourceBundle(db, id);
      if (!updated) {
        return reply.code(500).send({ error: "reject_failed" });
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
}
