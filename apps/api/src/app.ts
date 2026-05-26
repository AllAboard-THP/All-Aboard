import "./fastify-augmentation.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { desc, eq, sql } from "drizzle-orm";
import type {
  AuthMeResponse,
  CreateHelpRequestResponse,
  HelpRequest,
  HelpRequestDetailResponse,
  UserRole,
} from "@allaboard/types";
import type { AppDatabase } from "./db/client.js";
import { createDb, createPool } from "./db/client.js";
import { helpRequests } from "./db/schema.js";
import type pg from "pg";
import { z } from "zod";

const loginBodySchema = z.object({
  userId: z.string().min(1).max(256),
  password: z.string().min(1).max(256),
});

const createBodySchema = z.object({
  title: z.string().min(1).max(500),
  tags: z.array(z.string().max(64)).max(32).optional(),
});

export type BuildAppOptions = {
  pool?: pg.Pool | null;
};

function jwtSecret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production (min 32 characters)");
  }
  return "dev-only-jwt-secret-min-32-characters!!";
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function wordCount(title: string): number {
  return title.trim().split(/\s+/).filter(Boolean).length;
}

function mentorUserIds(): Set<string> {
  const raw = process.env.MVP_MENTOR_USER_IDS?.trim();
  const ids = raw && raw.length > 0 ? raw.split(",") : ["alice"];
  return new Set(ids.map((id) => id.trim()).filter(Boolean));
}

function roleForUserId(userId: string): UserRole {
  return mentorUserIds().has(userId) ? "mentor" : "student";
}

function rowToHelpRequest(row: typeof helpRequests.$inferSelect): HelpRequest {
  const tags = row.tags?.length ? row.tags : undefined;
  return {
    id: row.id,
    title: row.title,
    authorId: row.authorId,
    createdAt: row.createdAt.toISOString(),
    ...(tags ? { tags } : {}),
  };
}

export function buildApp(options?: BuildAppOptions) {
  const pool =
    options?.pool !== undefined ? options.pool : createPool();
  const db: AppDatabase | null = pool ? createDb(pool) : null;

  const app = Fastify({ logger: false });

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

  app.get("/feed", async (_request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const rows = await db
      .select()
      .from(helpRequests)
      .orderBy(desc(helpRequests.createdAt))
      .limit(100);
    return { items: rows.map(rowToHelpRequest) };
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_body" });
    }
    const expected = process.env.MVP_LOGIN_PASSWORD?.trim();
    if (!expected) {
      return reply.code(503).send({ error: "login_not_configured" });
    }
    if (parsed.data.password !== expected) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }
    const role = roleForUserId(parsed.data.userId);
    const token = await reply.jwtSign({
      sub: parsed.data.userId,
      role,
    });
    void reply.setCookie("access_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return { ok: true as const, userId: parsed.data.userId, role };
  });

  app.get(
    "/auth/me",
    { preHandler: [app.authenticate] },
    async (request): Promise<AuthMeResponse> => {
      const user = request.user as { sub: string; role?: UserRole };
      const role =
        user.role === "mentor" || user.role === "student"
          ? user.role
          : roleForUserId(user.sub);
      return { userId: user.sub, role };
    },
  );

  app.get("/help-requests/:id", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const { id } = request.params as { id: string };
    const rows = await db
      .select()
      .from(helpRequests)
      .where(eq(helpRequests.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return reply.code(404).send({ error: "not_found" });
    }
    const body: HelpRequestDetailResponse = {
      item: rowToHelpRequest(row),
      responses: [],
    };
    return body;
  });

  app.get("/mentor/feed", async (_request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const rows = await db
      .select()
      .from(helpRequests)
      .where(sql`cardinality(${helpRequests.tags}) > 0`)
      .orderBy(desc(helpRequests.createdAt))
      .limit(100);
    return { items: rows.map(rowToHelpRequest) };
  });

  app.post(
    "/help-requests",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateHelpRequestResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const user = request.user as { sub: string };
      const norm = normalizeTitle(parsed.data.title);
      const dup = await db
        .select({ id: helpRequests.id })
        .from(helpRequests)
        .where(
          sql`regexp_replace(lower(trim(${helpRequests.title})), '[[:space:]]+', ' ', 'g') = ${norm}`,
        )
        .limit(1);
      if (dup.length > 0) {
        return reply
          .code(409)
          .send({ error: "duplicate", existingId: dup[0].id });
      }
      const tags = parsed.data.tags ?? [];
      const inserted = await db
        .insert(helpRequests)
        .values({
          title: parsed.data.title.trim(),
          authorId: user.sub,
          tags,
        })
        .returning();
      const row = inserted[0];
      if (!row) {
        return reply.code(500).send({ error: "insert_failed" });
      }
      const item = rowToHelpRequest(row);
      const hints =
        wordCount(parsed.data.title) <= 6
          ? { rubberduckEligible: true as const }
          : undefined;
      void reply.code(201);
      return hints ? { item, hints } : { item };
    },
  );

  return app;
}
