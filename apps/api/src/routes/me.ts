import type { FastifyInstance } from "fastify";
import type { MyHelpRequestsResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { getJwtUser } from "../lib/auth-helpers.js";
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
      const user = getJwtUser(request);
      const items = await fetchHelpRequestsForAuthor(db, user.sub);
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
      const user = getJwtUser(request);
      const items = await fetchBookmarkedHelpRequests(db, user.sub);
      return { items };
    },
  );
}
