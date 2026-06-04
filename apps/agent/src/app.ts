import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import type { AgentRoutingEvaluateResponse } from "@allaboard/types";

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

  return app;
}
