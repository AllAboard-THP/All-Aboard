import "./fastify-augmentation.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { registerOpenApiDocs } from "./openapi.js";
import { desc, eq, inArray, sql } from "drizzle-orm";
import type {
  AuthMeResponse,
  CreateHelpRequestResponse,
  CreateResponseResponse,
  HelpRequest,
  HelpRequestDetailResponse,
  MentorFeedItem,
  Response,
  UserRole,
} from "@allaboard/types";
import type { AppDatabase } from "./db/client.js";
import { createDb, createPool } from "./db/client.js";
import { helpRequests, responses, users } from "./db/schema.js";
import {
  authenticateWithDatabase,
  authenticateWithMvpFallback,
  isMvpPasswordFallbackEnabled,
  loginBodySchema,
  resolveLoginEmail,
} from "./auth/login.js";
import type pg from "pg";
import { z } from "zod";

const createBodySchema = z.object({
  title: z.string().min(1).max(500),
  tags: z.array(z.string().max(64)).max(32).optional(),
});

const createResponseBodySchema = z.object({
  body: z.string().min(1).max(10_000),
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

function roleFromJwtClaims(
  sub: string,
  roleClaim: string | undefined,
): UserRole {
  if (roleClaim === "mentor" || roleClaim === "student") return roleClaim;
  if (sub.endsWith("@dev.local")) {
    return sub.startsWith("alice@") ? "mentor" : "student";
  }
  return "student";
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

function rowToResponse(row: typeof responses.$inferSelect): Response {
  return {
    id: row.id,
    helpRequestId: row.helpRequestId,
    body: row.body,
    authorId: row.authorId,
  };
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

function tagsOverlap(requestTags: string[], authorCerts: string[]): boolean {
  if (requestTags.length === 0 || authorCerts.length === 0) return false;
  const requestSet = new Set(requestTags.map(normalizeTag));
  return authorCerts.some((c) => requestSet.has(normalizeTag(c)));
}

function responseVisibleUnderCertificationFilter(
  responseAuthorId: string,
  requestAuthorId: string,
  requestTags: string[],
  authorCerts: string[],
): boolean {
  if (responseAuthorId === requestAuthorId) return true;
  return tagsOverlap(requestTags, authorCerts);
}

export async function buildApp(options?: BuildAppOptions) {
  const pool =
    options?.pool !== undefined ? options.pool : createPool();
  const db: AppDatabase | null = pool ? createDb(pool) : null;

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
    const email = resolveLoginEmail(parsed.data);
    if (!email) {
      return reply.code(400).send({ error: "invalid_body" });
    }

    let auth: { userId: string; role: UserRole } | "invalid_credentials" | "login_not_configured";

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
      const user = request.user as { sub: string; role?: UserRole };
      const role = roleFromJwtClaims(user.sub, user.role);
      return { userId: user.sub, role };
    },
  );

  app.get("/help-requests/:id", async (request, reply) => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const query = request.query as { filterByCertifications?: string };
    const filterByCertifications = query.filterByCertifications === "true";

    if (filterByCertifications) {
      try {
        await request.jwtVerify();
      } catch {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const user = request.user as { sub: string; role?: UserRole };
      const role = roleFromJwtClaims(user.sub, user.role);
      if (role !== "mentor") {
        return reply.code(403).send({ error: "forbidden" });
      }
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
    const responseRows = await db
      .select()
      .from(responses)
      .where(eq(responses.helpRequestId, id))
      .orderBy(responses.createdAt);

    let visibleRows = responseRows;
    if (filterByCertifications) {
      const authorEmails = [
        ...new Set(responseRows.map((r) => r.authorId)),
      ];
      const certByEmail = new Map<string, string[]>();
      if (authorEmails.length > 0) {
        const userRows = await db
          .select({
            email: users.email,
            certificationTags: users.certificationTags,
          })
          .from(users)
          .where(inArray(users.email, authorEmails));
        for (const u of userRows) {
          certByEmail.set(u.email, u.certificationTags ?? []);
        }
      }
      const requestTags = row.tags ?? [];
      visibleRows = responseRows.filter((r) =>
        responseVisibleUnderCertificationFilter(
          r.authorId,
          row.authorId,
          requestTags,
          certByEmail.get(r.authorId) ?? [],
        ),
      );
    }

    const body: HelpRequestDetailResponse = {
      item: rowToHelpRequest(row),
      responses: visibleRows.map(rowToResponse),
      ...(filterByCertifications
        ? {
            certificationFilter: {
              applied: true as const,
              totalCount: responseRows.length,
              visibleCount: visibleRows.length,
            },
          }
        : {}),
    };
    return body;
  });

  app.post(
    "/help-requests/:id/responses",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateResponseResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const parsed = createResponseBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const helpRows = await db
        .select({ id: helpRequests.id })
        .from(helpRequests)
        .where(eq(helpRequests.id, id))
        .limit(1);
      if (helpRows.length === 0) {
        return reply.code(404).send({ error: "not_found" });
      }
      const user = request.user as { sub: string };
      const inserted = await db
        .insert(responses)
        .values({
          helpRequestId: id,
          body: parsed.data.body.trim(),
          authorId: user.sub,
        })
        .returning();
      const row = inserted[0];
      if (!row) {
        return reply.code(500).send({ error: "insert_failed" });
      }
      void reply.code(201);
      return { item: rowToResponse(row) };
    },
  );

  app.get(
    "/mentor/feed",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const user = request.user as { sub: string; role?: UserRole };
      const role = roleFromJwtClaims(user.sub, user.role);
      if (role !== "mentor") {
        return reply.code(403).send({ error: "forbidden" });
      }
      const mentorId = user.sub;

      const rows = await db
        .select()
        .from(helpRequests)
        .where(sql`cardinality(${helpRequests.tags}) > 0`)
        .orderBy(desc(helpRequests.createdAt))
        .limit(100);

      const ids = rows.map((row) => row.id);
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

      const items: MentorFeedItem[] = rows.map((row) => {
        const base = rowToHelpRequest(row);
        const requestResponses = responsesByRequest.get(row.id) ?? [];
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
