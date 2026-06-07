import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import type {
  AgentRoutingEvaluateResponse,
  AgentSummaryGenerateResponse,
  AgentTagsSuggestResponse,
} from "@allaboard/types";
import {
  generateSummaryFallback,
  summaryGenerateBodySchema,
} from "./summary-generate.js";
import { suggestTagsFallback, tagsSuggestBodySchema } from "./tag-suggest.js";

/** Aligné stub API Phase 2 — suggestion redirect Rubberduck (service externe). */
const RUBBERDUCK_REDIRECT_WORD_THRESHOLD = 6;

const routingEvaluateBodySchema = z.object({
  title: z.string().min(1).max(500),
  tags: z.array(z.string().max(64)).max(32).optional(),
  authorId: z.string().max(256).optional(),
});

function wordCount(title: string): number {
  return title.trim().split(/\s+/).filter(Boolean).length;
}

function invalidBody(reply: FastifyReply) {
  return reply.status(400).send({ error: "invalid_body" as const });
}

export async function buildApp() {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ status: "ok" as const }));

  app.post(
    "/routing/evaluate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = routingEvaluateBodySchema.safeParse(request.body);
      if (!parsed.success) return invalidBody(reply);

      const wc = wordCount(parsed.data.title);
      const suggestRubberduckRedirect =
        wc <= RUBBERDUCK_REDIRECT_WORD_THRESHOLD;
      const body: AgentRoutingEvaluateResponse = {
        suggestRubberduckRedirect,
        ...(suggestRubberduckRedirect
          ? {
              reason: `title_word_count_${wc}_lte_${RUBBERDUCK_REDIRECT_WORD_THRESHOLD}`,
            }
          : {}),
      };
      return reply.status(200).send(body);
    },
  );

  app.post(
    "/tags/suggest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = tagsSuggestBodySchema.safeParse(request.body);
      if (!parsed.success) return invalidBody(reply);

      const title = parsed.data.title?.trim();
      const body = parsed.data.body?.trim();
      if (!title && !body) {
        return reply.status(200).send({ tags: [] } satisfies AgentTagsSuggestResponse);
      }

      const tags = suggestTagsFallback(title, body);
      return reply.status(200).send({ tags } satisfies AgentTagsSuggestResponse);
    },
  );

  app.post(
    "/summary/generate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = summaryGenerateBodySchema.safeParse(request.body);
      if (!parsed.success) return invalidBody(reply);

      const summary = generateSummaryFallback({
        title: parsed.data.title.trim(),
        body: parsed.data.body,
        codeSnippet: parsed.data.codeSnippet,
        responses: parsed.data.responses,
      });
      return reply
        .status(200)
        .send({ summary } satisfies AgentSummaryGenerateResponse);
    },
  );

  return app;
}
