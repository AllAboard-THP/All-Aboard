import type { FastifyInstance } from "fastify";
import type { FeedResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  countFeedItems,
  fetchFeedRows,
  fetchUnansweredRows,
  resolveSubjectIdBySlug,
} from "../lib/feed-query.js";
import { rowToHelpRequest } from "../lib/mappers.js";
import { parseFeedQuery } from "../lib/schemas.js";
import { authorProfileFor, loadAuthorProfiles } from "../services/user-profile.js";

export function registerFeedRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get("/feed", async (request, reply): Promise<FeedResponse | void> => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }

    const params = parseFeedQuery(request.query as Record<string, unknown>);

    let subjectId: string | null | undefined;
    if (params.subjectSlug) {
      subjectId = await resolveSubjectIdBySlug(db, params.subjectSlug);
      if (!subjectId) {
        return {
          items: [],
          pagination: { page: params.page, limit: params.limit, total: 0 },
        };
      }
    }

    const [rows, total] = await Promise.all([
      fetchFeedRows(db, params, subjectId ?? undefined),
      countFeedItems(db, params, subjectId ?? undefined),
    ]);

    const authorProfiles = await loadAuthorProfiles(
      db,
      rows.map(({ helpRequest }) => helpRequest.authorId),
    );

    const response: FeedResponse = {
      items: rows.map(({ helpRequest, subject }) =>
        rowToHelpRequest(
          helpRequest,
          subject,
          authorProfileFor(authorProfiles, helpRequest.authorId),
        ),
      ),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
      },
    };

    if (params.includeWidgets) {
      const unansweredRows = await fetchUnansweredRows(db);
      const unansweredProfiles = await loadAuthorProfiles(
        db,
        unansweredRows.map(({ helpRequest }) => helpRequest.authorId),
      );
      response.widgets = {
        unanswered: unansweredRows.map(({ helpRequest, subject }) =>
          rowToHelpRequest(
            helpRequest,
            subject,
            authorProfileFor(unansweredProfiles, helpRequest.authorId),
          ),
        ),
      };
    }

    return response;
  });
}
