import type { FastifyInstance } from "fastify";
import type { MyHelpRequestsResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  getJwtUser,
  resolveAuthenticatedUser,
  userAuthorIdKeys,
} from "../lib/auth-helpers.js";
import {
  fetchBookmarkedHelpRequests,
  fetchHelpRequestsForAuthor,
} from "../lib/help-request-query.js";

export function registerMeRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get(
    "/me/help-requests",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MyHelpRequestsResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
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
      const items = await fetchHelpRequestsForAuthor(
        db,
        userAuthorIdKeys(authUser),
      );
      return { items };
    },
  );

  app.get(
    "/me/bookmarks",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MyHelpRequestsResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
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
      const items = await fetchBookmarkedHelpRequests(
        db,
        userAuthorIdKeys(authUser),
      );
      return { items };
    },
  );
}
