import "./fastify-augmentation.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { desc, eq, inArray } from "drizzle-orm";
import type {
  AuthMeResponse,
  MentorFeedItem,
  UserRole,
} from "@allaboard/types";
import type pg from "pg";
import {
  authenticateWithDatabase,
  authenticateWithMvpFallback,
  isMvpPasswordFallbackEnabled,
  loginBodySchema,
  resolveLoginEmail,
} from "./auth/login.js";
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
import { registerFeedRoutes } from "./routes/feed.js";
import { registerHelpRequestRoutes } from "./routes/help-requests.js";
import { registerSubjectRoutes } from "./routes/subjects.js";

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

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_body" });
    }
    const email = resolveLoginEmail(parsed.data);
    if (!email) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    let auth:
      | { userId: string; role: UserRole }
      | "invalid_credentials"
      | "login_not_configured";

    if (db) {
      auth = await authenticateWithDatabase(db, email, parsed.data.password);
      if (auth === "invalid_credentials" && isMvpPasswordFallbackEnabled()) {
        auth = authenticateWithMvpFallback(parsed.data);
      }
    } else if (isMvpPasswordFallbackEnabled()) {
      auth = authenticateWithMvpFallback(parsed.data);
    } else {
      return reply.code(503).send({ error: "login_not_configured" });
    }

    if (auth === "login_not_configured") {
      return reply.code(503).send({ error: "login_not_configured" });
    }
    if (auth === "invalid_credentials") {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const token = await reply.jwtSign({
      sub: auth.userId,
      role: auth.role,
    });
    void reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    });
    return { ok: true as const, userId: auth.userId, role: auth.role };
  });

  app.get(
    "/auth/me",
    { preHandler: [app.authenticate] },
    async (request): Promise<AuthMeResponse> => {
      const user = getJwtUser(request);
      const role = roleFromJwtClaims(user.sub, user.role);
      return { userId: user.sub, role };
    },
  );

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
