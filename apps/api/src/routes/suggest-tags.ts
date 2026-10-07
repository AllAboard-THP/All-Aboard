import type { FastifyInstance } from "fastify";
import type { SuggestTagsResponse } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  createTagSuggestionEvaluator,
  type SuggestTagsFn,
} from "../agent/tag-suggestion.js";
import { suggestTagsBodySchema } from "../lib/schemas.js";

export function registerSuggestTagsRoutes(
  app: FastifyInstance,
  _db: AppDatabase | null,
  suggestTags?: SuggestTagsFn,
) {
  const evaluate = suggestTags ?? createTagSuggestionEvaluator();

  app.post(
    "/help-requests/suggest-tags",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<SuggestTagsResponse | void> => {
      const parsed = suggestTagsBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const title = parsed.data.title?.trim();
      const body = parsed.data.body?.trim();
      if (!title && !body) {
        return { tags: [] };
      }

      const result = await evaluate({
        ...(title ? { title } : {}),
        ...(body ? { body } : {}),
      });
      return { tags: result.tags };
    },
  );
}
