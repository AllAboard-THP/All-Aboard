import "./fastify-augmentation.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { desc, eq, inArray } from "drizzle-orm";
import type { MentorFeedItem } from "@allaboard/types";
import type pg from "pg";
import { createDb, createPool } from "./db/client.js";
import type { AppDatabase } from "./db/client.js";
import { helpRequests, responses, subjects } from "./db/schema.js";
import {
  createAgentRoutingEvaluator,
  type EvaluateRoutingFn,
} from "./agent/routing.js";
import {
  getJwtUser,
  jwtSecret,
  roleFromJwtClaims,
} from "./lib/auth-helpers.js";
import { mentorFeedWhere } from "./lib/feed-query.js";
import { rowToHelpRequest } from "./lib/mappers.js";
import { registerOpenApiDocs } from "./openapi.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerFeedRoutes } from "./routes/feed.js";
import { registerHelpRequestRoutes } from "./routes/help-requests.js";
import { registerLegalRoutes } from "./routes/legal.js";
import { registerMeRoutes } from "./routes/me.js";
import { registerSocialRoutes } from "./routes/social.js";
import { registerSubjectRoutes } from "./routes/subjects.js";
import { registerUserRoutes } from "./routes/users.js";

export type BuildAppOptions = {
  pool?: pg.Pool | null;
  /** Injecté en tests (#68) ; défaut : client HTTP vers `AGENT_URL` + fallback. */
  evaluateRouting?: EvaluateRoutingFn;
};

export async function buildApp(options?: BuildAppOptions) {
  const pool =
    options?.pool !== undefined ? options.pool : createPool();
  const db: AppDatabase | null = pool ? createDb(pool) : null;
  const evaluateRouting =
    options?.evaluateRouting ?? createAgentRoutingEvaluator();

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
  registerSocialRoutes(app, db);
  registerMeRoutes(app, db);
  registerAuthRoutes(app, db);
  registerUserRoutes(app, db);
  registerLegalRoutes(app, db);

  app.get(
    "/mentor/feed",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const user = getJwtUser(request);
      const role = roleFromJwtClaims(user.sub, user.role);
      if (role !== "mentor") {
        return reply.code(403).send({ error: "forbidden" });
      }
      const mentorId = user.sub;

      const rows = await db
        .select({
          helpRequest: helpRequests,
          subject: subjects,
        })
        .from(helpRequests)
        .leftJoin(subjects, eq(helpRequests.subjectId, subjects.id))
        .where(mentorFeedWhere)
        .orderBy(desc(helpRequests.createdAt))
        .limit(100);

      const ids = rows.map((row) => row.helpRequest.id);
      const responsesByRequest = new Map<
        string,
        Array<typeof responses.$inferSelect>
      >();

      if (ids.length > 0) {
        const responseRows = await db
          .select()
          .from(responses)
          .where(inArray(responses.helpRequestId, ids))
          .orderBy(responses.createdAt);
        for (const row of responseRows) {
          const list = responsesByRequest.get(row.helpRequestId) ?? [];
          list.push(row);
          responsesByRequest.set(row.helpRequestId, list);
        }
      }

      const items: MentorFeedItem[] = rows.map(({ helpRequest, subject }) => {
        const base = rowToHelpRequest(helpRequest, subject);
        const requestResponses = responsesByRequest.get(helpRequest.id) ?? [];
        const responseCount = requestResponses.length;
        let lastResponseAt: string | null = null;
        let hasUnreadForMentor = false;
        if (responseCount > 0) {
          const last = requestResponses[responseCount - 1]!;
          lastResponseAt = last.createdAt.toISOString();
          hasUnreadForMentor = last.authorId !== mentorId;
        }
        return {
          ...base,
          responseCount,
          lastResponseAt,
          hasUnreadForMentor,
        };
      });

      return { items };
    },
  );

  return app;
}
