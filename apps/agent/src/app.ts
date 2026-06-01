import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import type {
  RubberduckEvaluateResponse,
  RubberduckRespondResponse,
} from "@allaboard/types";

const RUBBERDUCK_WORD_THRESHOLD = 6;

const evaluateBodySchema = z.object({
  title: z.string().min(1).max(500),
  tags: z.array(z.string().max(64)).max(32).optional(),
  authorId: z.string().max(256).optional(),
});

const respondBodySchema = z.object({
  helpRequestId: z.uuid(),
  title: z.string().min(1).max(500),
  context: z.string().max(10_000).optional(),
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
    "/rubberduck/evaluate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = evaluateBodySchema.safeParse(request.body);
      if (!parsed.success) return invalidBody(reply);

      const wc = wordCount(parsed.data.title);
      const eligible = wc <= RUBBERDUCK_WORD_THRESHOLD;
      const body: RubberduckEvaluateResponse = {
        eligible,
        ...(eligible
          ? {
              reason: `title_word_count_${wc}_lte_${RUBBERDUCK_WORD_THRESHOLD}`,
            }
          : {}),
      };
      return reply.status(200).send(body);
    },
  );

  app.post(
    "/rubberduck/respond",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = respondBodySchema.safeParse(request.body);
      if (!parsed.success) return invalidBody(reply);

      const body: RubberduckRespondResponse = {
        message:
          "Rubberduck stub: AI responses are not wired yet. Try expanding your question or wait for a mentor.",
        sessionId: `stub-${parsed.data.helpRequestId}`,
      };
      return reply.status(200).send(body);
    },
  );

  return app;
}
