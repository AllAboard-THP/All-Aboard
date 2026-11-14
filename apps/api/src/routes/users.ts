import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type {
  PublicUserResponse,
  UpdateUserMeResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, responses, subjects, users } from "../db/schema.js";
import { getJwtUser, authorIdKeysFromRow } from "../lib/auth-helpers.js";
import { rowToHelpRequest, rowToResponse } from "../lib/mappers.js";
import {
  parsePublicUserQuery,
  updateUserMeBodySchema,
} from "../lib/schemas.js";
import {
  rowToUserProfile,
  rowToUserPublicProfile,
} from "../lib/user-mappers.js";
import {
  countUserPosts,
  countUserResponses,
  loadCompetenceSubjects,
  loadUserFromJwtSub,
  loadUserById,
  loadUserByEmail,
  syncMentorSubjects,
} from "../services/user-profile.js";

export function registerUserRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.patch(
    "/users/me",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<UpdateUserMeResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = updateUserMeBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const row = await loadUserFromJwtSub(db, jwtUser.sub);
      if (!row) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const data = parsed.data;
      const patch: Partial<typeof users.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (data.fullName !== undefined) patch.fullName = data.fullName.trim();
      if (data.headline !== undefined) {
        patch.headline = data.headline?.trim() || null;
      }
      if (data.bio !== undefined) patch.bio = data.bio?.trim() || null;
      if (data.avatarUrl !== undefined) {
        patch.avatarUrl = data.avatarUrl?.trim() || null;
      }
      if (data.educationLevel !== undefined) {
        patch.educationLevel = data.educationLevel?.trim() || null;
      }
      if (data.notifyOnComment !== undefined) {
        patch.notifyOnComment = data.notifyOnComment;
      }
      if (data.notifyOnMessage !== undefined) {
        patch.notifyOnMessage = data.notifyOnMessage;
      }
      if (data.certificationTags !== undefined) {
        patch.certificationTags = data.certificationTags.map((t) =>
          t.trim().toLowerCase(),
        );
      }

      await db.update(users).set(patch).where(eq(users.id, row.id));

      if (data.subjectIds !== undefined) {
        await syncMentorSubjects(db, row.id, data.subjectIds);
      }

      const updated = await loadUserFromJwtSub(db, jwtUser.sub);
      if (!updated) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      const competenceSubjects = await loadCompetenceSubjects(db, updated.id);
      return { item: rowToUserProfile(updated, competenceSubjects) };
    },
  );

  app.get(
    "/users/:id",
    async (request, reply): Promise<PublicUserResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }

      const { id } = request.params as { id: string };
      const row =
        (await loadUserById(db, id)) ?? (await loadUserByEmail(db, id));
      if (!row) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const query = parsePublicUserQuery(
        request.query as Record<string, unknown>,
      );
      const competenceSubjects = await loadCompetenceSubjects(db, row.id);
      const stats = {
        postsCount: await countUserPosts(db, row),
        responsesCount: await countUserResponses(db, row),
      };
      const profile = rowToUserPublicProfile(row, stats, competenceSubjects);
      const authorKeys = authorIdKeysFromRow(row);

      if (query.tab === "responses") {
        const responseRows = await db
          .select()
          .from(responses)
          .where(inArray(responses.authorId, authorKeys))
          .orderBy(desc(responses.createdAt))
          .limit(query.limit)
          .offset(query.offset);
        const items = responseRows.map((r) => rowToResponse(r));
        return {
          profile,
          tab: "responses" as const,
          items,
          pagination: {
            page: query.page,
            limit: query.limit,
            total: stats.responsesCount,
          },
        };
      }

      const postRows = await db
        .select({
          helpRequest: helpRequests,
          subject: subjects,
        })
        .from(helpRequests)
        .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
        .where(
          and(
            inArray(helpRequests.authorId, authorKeys),
            isNull(helpRequests.deletedAt),
            eq(helpRequests.flaggedForModeration, false),
          ),
        )
        .orderBy(desc(helpRequests.createdAt))
        .limit(query.limit)
        .offset(query.offset);

      const items = postRows.map(({ helpRequest, subject }) =>
        rowToHelpRequest(helpRequest, subject),
      );

      return {
        profile,
        tab: "posts" as const,
        items,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: stats.postsCount,
        },
      };
    },
  );
}
