import "./fastify-augmentation.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import type pg from "pg";
import { createDb, createPool } from "./db/client.js";
import type { AppDatabase } from "./db/client.js";
import {
  createAgentRoutingEvaluator,
  type EvaluateRoutingFn,
} from "./agent/routing.js";
import { jwtSecret } from "./lib/auth-helpers.js";
import { registerOpenApiDocs } from "./openapi.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerFeedRoutes } from "./routes/feed.js";
import { registerHelpRequestRoutes } from "./routes/help-requests.js";
import { registerLegalRoutes } from "./routes/legal.js";
import { registerMeRoutes } from "./routes/me.js";
import { registerConversationRoutes } from "./routes/conversations.js";
import { registerConversationWsRoutes } from "./routes/conversations-ws.js";
import { registerMentorRoutes } from "./routes/mentor.js";
import { registerResourceRoutes } from "./routes/resources.js";
import { registerSocialRoutes } from "./routes/social.js";
import { registerSubjectRequestRoutes } from "./routes/subject-requests.js";
import { registerSubjectRoutes } from "./routes/subjects.js";
import { registerSuggestTagsRoutes } from "./routes/suggest-tags.js";
import { registerUserRoutes } from "./routes/users.js";
import type { SuggestTagsFn } from "./agent/tag-suggestion.js";

export type BuildAppOptions = {
  pool?: pg.Pool | null;
  /** Injecté en tests (#68) ; défaut : client HTTP vers `AGENT_URL` + fallback. */
  evaluateRouting?: EvaluateRoutingFn;
  suggestTags?: SuggestTagsFn;
};

export async function buildApp(options?: BuildAppOptions) {
  const pool =
    options?.pool !== undefined ? options.pool : createPool();
  const db: AppDatabase | null = pool ? createDb(pool) : null;
  const evaluateRouting =
    options?.evaluateRouting ?? createAgentRoutingEvaluator();
  const suggestTags = options?.suggestTags;

  const app = Fastify({ logger: false });

  await registerOpenApiDocs(app);

  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  if (corsOrigins && corsOrigins.length > 0) {
    void app.register(cors, {
      origin: corsOrigins,
      credentials: true,
    });
  }

  void app.register(cookie);
  void app.register(jwt, { secret: jwtSecret() });

  app.decorate(
    "authenticate",
    async function authenticate(
      request: FastifyRequest,
      reply: FastifyReply,
    ) {
      try {
        await request.jwtVerify();
      } catch {
        await reply.code(401).send({ error: "unauthorized" });
      }
    },
  );

  app.get("/health", async () => ({ status: "ok" as const }));

  registerFeedRoutes(app, db);
  registerSubjectRoutes(app, db);
  registerHelpRequestRoutes(app, db, evaluateRouting);
  registerSuggestTagsRoutes(app, db, suggestTags);
  registerSocialRoutes(app, db);
  registerMeRoutes(app, db);
  registerAuthRoutes(app, db);
  registerUserRoutes(app, db);
  registerLegalRoutes(app, db);
  registerResourceRoutes(app, db);
  registerSubjectRequestRoutes(app, db);
  registerMentorRoutes(app, db);
  registerConversationRoutes(app, db);
  await registerConversationWsRoutes(app, db);
  registerAdminRoutes(app, db);

  return app;
}
