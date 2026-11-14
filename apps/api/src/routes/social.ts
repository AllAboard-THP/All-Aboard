import type { FastifyInstance } from "fastify";
import { and, eq, sql } from "drizzle-orm";
import type {
  ToggleBookmarkResponse,
  ToggleLikeResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { bookmarks, helpRequests, likes } from "../db/schema.js";
import { getJwtUser, resolveAuthenticatedUser } from "../lib/auth-helpers.js";
import { helpRequestExists, loadHelpRequestRow } from "../lib/help-request-query.js";
import { rowToHelpRequest } from "../lib/mappers.js";

async function toggleLike(
  db: AppDatabase,
  userId: string,
  helpRequestId: string,
): Promise<ToggleLikeResponse> {
  const existing = await db
    .select({ id: likes.id })
    .from(likes)
    .where(
      and(eq(likes.userId, userId), eq(likes.helpRequestId, helpRequestId)),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(likes).where(eq(likes.id, existing[0]!.id));
    const updated = await db
      .update(helpRequests)
      .set({
        likesCount: sql`GREATEST(0, ${helpRequests.likesCount} - 1)`,
        updatedAt: new Date(),
      })
      .where(eq(helpRequests.id, helpRequestId))
      .returning({ likesCount: helpRequests.likesCount });
    return {
      liked: false,
      likesCount: updated[0]?.likesCount ?? 0,
    };
  }

  await db.insert(likes).values({ userId, helpRequestId });
  const updated = await db
    .update(helpRequests)
    .set({
      likesCount: sql`${helpRequests.likesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(helpRequests.id, helpRequestId))
    .returning({ likesCount: helpRequests.likesCount });
  return {
    liked: true,
    likesCount: updated[0]?.likesCount ?? 1,
  };
}

async function toggleBookmark(
  db: AppDatabase,
  userId: string,
  helpRequestId: string,
): Promise<ToggleBookmarkResponse> {
  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.helpRequestId, helpRequestId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0]!.id));
    const updated = await db
      .update(helpRequests)
      .set({
        bookmarksCount: sql`GREATEST(0, ${helpRequests.bookmarksCount} - 1)`,
        updatedAt: new Date(),
      })
      .where(eq(helpRequests.id, helpRequestId))
      .returning({ bookmarksCount: helpRequests.bookmarksCount });
    return {
      bookmarked: false,
      bookmarksCount: updated[0]?.bookmarksCount ?? 0,
    };
  }

  await db.insert(bookmarks).values({ userId, helpRequestId });
  const updated = await db
    .update(helpRequests)
    .set({
      bookmarksCount: sql`${helpRequests.bookmarksCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(helpRequests.id, helpRequestId))
    .returning({ bookmarksCount: helpRequests.bookmarksCount });
  return {
    bookmarked: true,
    bookmarksCount: updated[0]?.bookmarksCount ?? 1,
  };
}

export function registerSocialRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.post(
    "/help-requests/:id/likes",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<ToggleLikeResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      if (!(await helpRequestExists(db, id))) {
        return reply.code(404).send({ error: "not_found" });
      }
      const jwtUser = getJwtUser(request);
      const authUser = await resolveAuthenticatedUser(
        db,
        jwtUser.sub,
        jwtUser.role,
      );
      if (!authUser) {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const result = await toggleLike(db, authUser.id, id);
      const loaded = await loadHelpRequestRow(db, id);
      return {
        ...result,
        item: rowToHelpRequest(loaded!.helpRequest, loaded!.subject),
      };
    },
  );

  app.post(
    "/help-requests/:id/bookmarks",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<ToggleBookmarkResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      if (!(await helpRequestExists(db, id))) {
        return reply.code(404).send({ error: "not_found" });
      }
      const jwtUser = getJwtUser(request);
      const authUser = await resolveAuthenticatedUser(
        db,
        jwtUser.sub,
        jwtUser.role,
      );
      if (!authUser) {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const result = await toggleBookmark(db, authUser.id, id);
      const loaded = await loadHelpRequestRow(db, id);
      return {
        ...result,
        item: rowToHelpRequest(loaded!.helpRequest, loaded!.subject),
      };
    },
  );
}
