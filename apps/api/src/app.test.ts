import pg from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
import { buildApp } from "./app";
import { defaultSeedUsers, defaultSeedSubjects, seedSubjects, seedUsers } from "./db/seed";
import { outboxEvents } from "./db/schema";
import { HELP_REQUEST_CREATED } from "./intuition/outbox";
import { isOpenApiDocsEnabled } from "./openapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
describe("api", () => {
  it("GET /health returns 200", async () => {
    const app = await buildApp({ pool: null });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: "ok" });
    await app.close();
  });

  it("GET /feed returns 503 when database is not configured", async () => {
    const app = await buildApp({ pool: null });
    const res = await app.inject({ method: "GET", url: "/feed" });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.payload) as { error: string };
    expect(body.error).toBe("database_unavailable");
    await app.close();
  });

  it("POST /auth/login returns 503 when login is not configured (staging, no DB)", async () => {
    const prevPassword = process.env.MVP_LOGIN_PASSWORD;
    const prevAppEnv = process.env.APP_ENV;
    delete process.env.MVP_LOGIN_PASSWORD;
    process.env.APP_ENV = "staging";
    const app = await buildApp({ pool: null });
    try {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "bob@dev.local", password: "any" },
      });
      expect(res.statusCode).toBe(503);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("login_not_configured");
    } finally {
      if (prevPassword !== undefined) {
        process.env.MVP_LOGIN_PASSWORD = prevPassword;
      } else {
        delete process.env.MVP_LOGIN_PASSWORD;
      }
      if (prevAppEnv !== undefined) {
        process.env.APP_ENV = prevAppEnv;
      } else {
        delete process.env.APP_ENV;
      }
      await app.close();
    }
  });

  it("POST /auth/login sets Secure cookie when NODE_ENV is production", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevAppEnv = process.env.APP_ENV;
    const prevJwt = process.env.JWT_SECRET;
    const prevPassword = process.env.MVP_LOGIN_PASSWORD;
    process.env.NODE_ENV = "production";
    process.env.APP_ENV = "development";
    process.env.JWT_SECRET = "test-jwt-secret-min-32-characters!!";
    process.env.MVP_LOGIN_PASSWORD = "test-login-password";
    const app = await buildApp({ pool: null });
    await app.ready();
    try {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "bob", password: "test-login-password" },
      });
      expect(res.statusCode).toBe(200);
      const setCookie = res.headers["set-cookie"];
      const cookieStr = Array.isArray(setCookie)
        ? setCookie.join("; ")
        : String(setCookie ?? "");
      expect(cookieStr.toLowerCase()).toContain("secure");
    } finally {
      if (prevNodeEnv !== undefined) {
        process.env.NODE_ENV = prevNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }
      if (prevAppEnv !== undefined) {
        process.env.APP_ENV = prevAppEnv;
      } else {
        delete process.env.APP_ENV;
      }
      if (prevJwt !== undefined) {
        process.env.JWT_SECRET = prevJwt;
      } else {
        delete process.env.JWT_SECRET;
      }
      if (prevPassword !== undefined) {
        process.env.MVP_LOGIN_PASSWORD = prevPassword;
      } else {
        delete process.env.MVP_LOGIN_PASSWORD;
      }
      await app.close();
    }
  });

  it("POST /help-requests returns 503 when database is not configured", async () => {
    const app = await buildApp({ pool: null });
    await app.ready();
    const token = app.jwt.sign({ sub: "bob" });
    const res = await app.inject({
      method: "POST",
      url: "/help-requests",
      headers: { authorization: `Bearer ${token}` },
      payload: { title: "No database" },
    });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.payload) as { error: string };
    expect(body.error).toBe("database_unavailable");
    await app.close();
  });
});

describe("CORS", () => {
  it("does not set Access-Control-Allow-Origin when CORS_ALLOWED_ORIGINS is unset", async () => {
    const prev = process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.CORS_ALLOWED_ORIGINS;
    const app = await buildApp({ pool: null });
    await app.ready();
    try {
      const getRes = await app.inject({
        method: "GET",
        url: "/health",
        headers: { origin: "https://staging.allaboard.fr" },
      });
      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers["access-control-allow-origin"]).toBeUndefined();

      const optionsRes = await app.inject({
        method: "OPTIONS",
        url: "/health",
        headers: {
          origin: "https://staging.allaboard.fr",
          "access-control-request-method": "GET",
        },
      });
      expect(optionsRes.headers["access-control-allow-origin"]).toBeUndefined();
    } finally {
      if (prev !== undefined) {
        process.env.CORS_ALLOWED_ORIGINS = prev;
      }
      await app.close();
    }
  });

  it("sets CORS headers with credentials for allowed origin preflight", async () => {
    const prev = process.env.CORS_ALLOWED_ORIGINS;
    process.env.CORS_ALLOWED_ORIGINS = "https://staging.allaboard.fr";
    const app = await buildApp({ pool: null });
    await app.ready();
    try {
      const optionsRes = await app.inject({
        method: "OPTIONS",
        url: "/health",
        headers: {
          origin: "https://staging.allaboard.fr",
          "access-control-request-method": "GET",
        },
      });
      expect(optionsRes.headers["access-control-allow-origin"]).toBe(
        "https://staging.allaboard.fr",
      );
      expect(optionsRes.headers["access-control-allow-credentials"]).toBe(
        "true",
      );

      const getRes = await app.inject({
        method: "GET",
        url: "/health",
        headers: { origin: "https://staging.allaboard.fr" },
      });
      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers["access-control-allow-origin"]).toBe(
        "https://staging.allaboard.fr",
      );
      expect(getRes.headers["access-control-allow-credentials"]).toBe(
        "true",
      );
    } finally {
      if (prev !== undefined) {
        process.env.CORS_ALLOWED_ORIGINS = prev;
      } else {
        delete process.env.CORS_ALLOWED_ORIGINS;
      }
      await app.close();
    }
  });

  it("does not reflect disallowed origins", async () => {
    const prev = process.env.CORS_ALLOWED_ORIGINS;
    process.env.CORS_ALLOWED_ORIGINS = "https://staging.allaboard.fr";
    const app = await buildApp({ pool: null });
    await app.ready();
    try {
      const optionsRes = await app.inject({
        method: "OPTIONS",
        url: "/health",
        headers: {
          origin: "https://evil.example.com",
          "access-control-request-method": "GET",
        },
      });
      expect(optionsRes.headers["access-control-allow-origin"]).toBeUndefined();
    } finally {
      if (prev !== undefined) {
        process.env.CORS_ALLOWED_ORIGINS = prev;
      } else {
        delete process.env.CORS_ALLOWED_ORIGINS;
      }
      await app.close();
    }
  });
});

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "api with database",
  () => {
    let pool: pg.Pool;
    let app: Awaited<ReturnType<typeof buildApp>>;

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool);
      await migrate(db, {
        migrationsFolder: path.join(__dirname, "../drizzle"),
      });
      const specs = defaultSeedUsers();
      if (specs.length > 0) {
        await seedUsers(db, specs);
      }
      await seedSubjects(db, defaultSeedSubjects());
      app = await buildApp({ pool });
    });

    afterAll(async () => {
      await app.close();
      await pool.end();
    });

    it("GET /feed returns 200 with items array and pagination", async () => {
      const res = await app.inject({ method: "GET", url: "/feed" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        items: unknown[];
        pagination: { page: number; limit: number; total: number };
      };
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.pagination.page).toBe(1);
      expect(typeof body.pagination.total).toBe("number");
    });

    it("GET /feed includes created item with tags", async () => {
      const title = `Feed tags ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, tags: ["mentor", "rails"] },
      });
      expect(createRes.statusCode).toBe(201);

      const feedRes = await app.inject({ method: "GET", url: "/feed" });
      expect(feedRes.statusCode).toBe(200);
      const feed = JSON.parse(feedRes.payload) as {
        items: Array<{
          title: string;
          tags?: string[];
        }>;
      };
      const found = feed.items.find((i) => i.title === title);
      expect(found).toBeDefined();
      expect(found?.tags).toEqual(["mentor", "rails"]);
    });

    it("POST /auth/login rejects wrong password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "bob@dev.local", password: "wrong" },
      });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("invalid_credentials");
    });

    it("POST /auth/login succeeds with email and password hash", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "bob@dev.local", password: seedPassword },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        ok: boolean;
        userId: string;
        role: string;
      };
      expect(body).toEqual({
        ok: true,
        userId: "bob@dev.local",
        role: "student",
      });
      const setCookie = res.headers["set-cookie"];
      const cookieStr = Array.isArray(setCookie)
        ? setCookie.join("; ")
        : String(setCookie ?? "");
      expect(cookieStr).toContain("access_token=");
    });

    it("POST /auth/login returns 400 for invalid body", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "" },
      });
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("invalid_body");
    });

    it("POST /help-requests returns 401 without token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        payload: { title: "Need help with tests" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /help-requests returns 400 for invalid body", async () => {
      const token = app.jwt.sign({ sub: "bob" });
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title: "" },
      });
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("invalid_body");
    });

    it("POST /help-requests creates item when authorized", async () => {
      const title = `Vitest help ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob" });
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, tags: ["rails"] },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as {
        item: { id: string; title: string; authorId: string };
      };
      expect(body.item.title).toBe(title);
      expect(body.item.authorId).toBe("bob");
    });

    it("POST /help-requests enqueues help_request.created outbox event", async () => {
      const title = `Outbox on create ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob" });
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, tags: ["typescript"] },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as { item: { id: string } };
      const db = drizzle(pool);
      const rows = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.aggregateId, body.item.id));
      expect(rows).toHaveLength(1);
      expect(rows[0]?.eventType).toBe(HELP_REQUEST_CREATED);
      const payload = rows[0]?.payload as {
        id: string;
        title: string;
        authorId: string;
        tags?: string[];
      };
      expect(payload.id).toBe(body.item.id);
      expect(payload.title).toBe(title);
      expect(payload.authorId).toBe("bob");
      expect(payload.tags).toEqual(["typescript"]);
    });

    it("POST /help-requests returns 409 for duplicate title", async () => {
      const title = `Duplicate ${Date.now()}`;
      const token = app.jwt.sign({ sub: "alice" });
      const headers = { authorization: `Bearer ${token}` };
      const first = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers,
        payload: { title },
      });
      expect(first.statusCode).toBe(201);
      const second = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers,
        payload: { title: `   ${title}  ` },
      });
      expect(second.statusCode).toBe(409);
      const err = JSON.parse(second.payload) as { existingId: string };
      expect(typeof err.existingId).toBe("string");
    });

    it("POST /help-requests includes rubberduck hint for short titles", async () => {
      const token = app.jwt.sign({ sub: "bob" });
      const title = `Short ${Date.now()}`;
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as {
        hints?: { rubberduckEligible?: boolean };
      };
      expect(body.hints?.rubberduckEligible).toBe(true);
    });

    it("POST /help-requests omits rubberduck hint for long titles", async () => {
      const token = app.jwt.sign({ sub: "bob" });
      const title = `This is a much longer help request title ${Date.now()}`;
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as {
        hints?: { rubberduckEligible?: boolean };
      };
      expect(body.hints).toBeUndefined();
    });

    it("POST /help-requests maps agent routing to rubberduck hint", async () => {
      const agentApp = await buildApp({
        pool,
        evaluateRouting: async () => ({
          suggestRubberduckRedirect: true,
          reason: "agent_mock",
        }),
      });
      const token = agentApp.jwt.sign({ sub: "bob" });
      const title = `Agent routed long title ${Date.now()} with many words`;
      const res = await agentApp.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as {
        hints?: { rubberduckEligible?: boolean };
      };
      expect(body.hints?.rubberduckEligible).toBe(true);
      await agentApp.close();
    });

    it("POST /help-requests omits rubberduck hint when agent declines redirect", async () => {
      const agentApp = await buildApp({
        pool,
        evaluateRouting: async () => ({
          suggestRubberduckRedirect: false,
          reason: "agent_mock",
        }),
      });
      const token = agentApp.jwt.sign({ sub: "bob" });
      const title = `Short ${Date.now()}`;
      const res = await agentApp.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as {
        hints?: { rubberduckEligible?: boolean };
      };
      expect(body.hints).toBeUndefined();
      await agentApp.close();
    });

    it("POST /help-requests delegates routing to live agent when AGENT_URL is set", async () => {
      const { buildApp: buildAgentApp } = await import(
        "../../agent/src/app.js"
      );
      const liveAgent = await buildAgentApp();
      await liveAgent.listen({ port: 0, host: "127.0.0.1" });
      const address = liveAgent.server.address();
      if (!address || typeof address === "string") {
        throw new Error("agent listen address unavailable");
      }
      const prevAgentUrl = process.env.AGENT_URL;
      process.env.AGENT_URL = `http://127.0.0.1:${address.port}`;
      const apiWithAgent = await buildApp({ pool });
      try {
        const token = apiWithAgent.jwt.sign({ sub: "bob" });
        const title = `Short ${Date.now()}`;
        const res = await apiWithAgent.inject({
          method: "POST",
          url: "/help-requests",
          headers: { authorization: `Bearer ${token}` },
          payload: { title },
        });
        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.payload) as {
          hints?: { rubberduckEligible?: boolean };
        };
        expect(body.hints?.rubberduckEligible).toBe(true);
      } finally {
        if (prevAgentUrl === undefined) {
          delete process.env.AGENT_URL;
        } else {
          process.env.AGENT_URL = prevAgentUrl;
        }
        await apiWithAgent.close();
        await liveAgent.close();
      }
    });

    it("GET /help-requests/:id returns 404 for unknown id", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/help-requests/00000000-0000-0000-0000-000000000099",
      });
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("not_found");
    });

    it("GET /help-requests/:id returns created item", async () => {
      const title = `Detail GET ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, tags: ["rails"] },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as {
        item: { id: string; title: string };
      };

      const res = await app.inject({
        method: "GET",
        url: `/help-requests/${created.item.id}`,
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        item: { id: string; title: string; tags?: string[] };
        responses: unknown[];
      };
      expect(body.item.id).toBe(created.item.id);
      expect(body.item.title).toBe(title);
      expect(body.item.tags).toEqual(["rails"]);
      expect(body.responses).toEqual([]);
    });

    it("POST /help-requests/:id/responses returns 401 without token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/help-requests/00000000-0000-0000-0000-000000000099/responses",
        payload: { body: "Try without auth" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /help-requests/:id/responses returns 404 for unknown help request", async () => {
      const token = app.jwt.sign({ sub: "alice@dev.local", role: "mentor" });
      const res = await app.inject({
        method: "POST",
        url: "/help-requests/00000000-0000-0000-0000-000000000099/responses",
        headers: { authorization: `Bearer ${token}` },
        payload: { body: "Helpful answer" },
      });
      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("not_found");
    });

    it("POST /help-requests/:id/responses creates response and GET detail includes it", async () => {
      const title = `Responses thread ${Date.now()}`;
      const bobToken = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { title, tags: ["rails"] },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as {
        item: { id: string };
      };

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const responseBody = "Voici une piste pour débloquer ton erreur.";
      const postRes = await app.inject({
        method: "POST",
        url: `/help-requests/${created.item.id}/responses`,
        headers: { authorization: `Bearer ${aliceToken}` },
        payload: { body: responseBody },
      });
      expect(postRes.statusCode).toBe(201);
      const posted = JSON.parse(postRes.payload) as {
        item: {
          id: string;
          helpRequestId: string;
          body: string;
          authorId: string;
        };
      };
      expect(posted.item.helpRequestId).toBe(created.item.id);
      expect(posted.item.body).toBe(responseBody);
      expect(posted.item.authorId).toBe("alice@dev.local");

      const detailRes = await app.inject({
        method: "GET",
        url: `/help-requests/${created.item.id}`,
      });
      expect(detailRes.statusCode).toBe(200);
      const detail = JSON.parse(detailRes.payload) as {
        responses: Array<{ id: string; body: string; authorId: string }>;
      };
      expect(detail.responses).toHaveLength(1);
      expect(detail.responses[0]?.id).toBe(posted.item.id);
      expect(detail.responses[0]?.body).toBe(responseBody);
      expect(detail.responses[0]?.authorId).toBe("alice@dev.local");
    });

    it("GET /help-requests/:id?filterByCertifications=true returns 401 without token", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/help-requests/00000000-0000-0000-0000-000000000099?filterByCertifications=true",
      });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("unauthorized");
    });

    it("GET /help-requests/:id?filterByCertifications=true returns 403 for student", async () => {
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const res = await app.inject({
        method: "GET",
        url: "/help-requests/00000000-0000-0000-0000-000000000099?filterByCertifications=true",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("forbidden");
    });

    it("GET /help-requests/:id filters responses by certification overlap for mentor", async () => {
      const title = `Cert filter ${Date.now()}`;
      const bobToken = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { title, tags: ["react", "rails"] },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as { item: { id: string } };
      const id = created.item.id;

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const charlieToken = app.jwt.sign({
        sub: "charlie@dev.local",
        role: "student",
      });

      await app.inject({
        method: "POST",
        url: `/help-requests/${id}/responses`,
        headers: { authorization: `Bearer ${aliceToken}` },
        payload: { body: "Piste mentor react" },
      });
      await app.inject({
        method: "POST",
        url: `/help-requests/${id}/responses`,
        headers: { authorization: `Bearer ${charlieToken}` },
        payload: { body: "Piste hors certifications" },
      });
      await app.inject({
        method: "POST",
        url: `/help-requests/${id}/responses`,
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { body: "Précision du demandeur" },
      });

      const unfilteredRes = await app.inject({
        method: "GET",
        url: `/help-requests/${id}`,
      });
      expect(unfilteredRes.statusCode).toBe(200);
      const unfiltered = JSON.parse(unfilteredRes.payload) as {
        responses: Array<{ authorId: string }>;
      };
      expect(unfiltered.responses).toHaveLength(3);

      const filteredRes = await app.inject({
        method: "GET",
        url: `/help-requests/${id}?filterByCertifications=true`,
        headers: { authorization: `Bearer ${aliceToken}` },
      });
      expect(filteredRes.statusCode).toBe(200);
      const filtered = JSON.parse(filteredRes.payload) as {
        responses: Array<{ authorId: string; body: string }>;
        certificationFilter: {
          applied: boolean;
          totalCount: number;
          visibleCount: number;
        };
      };
      expect(filtered.certificationFilter).toEqual({
        applied: true,
        totalCount: 3,
        visibleCount: 2,
      });
      expect(filtered.responses).toHaveLength(2);
      const authors = filtered.responses.map((r) => r.authorId);
      expect(authors).toContain("alice@dev.local");
      expect(authors).toContain("bob@dev.local");
      expect(authors).not.toContain("charlie@dev.local");
    });

    it("GET /auth/me returns role for mentor alice@dev.local on login", async () => {
      const loginRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { email: "alice@dev.local", password: seedPassword },
      });
      expect(loginRes.statusCode).toBe(200);
      const loginBody = JSON.parse(loginRes.payload) as { role: string };
      expect(loginBody.role).toBe("mentor");

      const setCookie = loginRes.headers["set-cookie"];
      const cookieStr = Array.isArray(setCookie)
        ? setCookie.join("; ")
        : String(setCookie ?? "");
      const match = cookieStr.match(/access_token=([^;]+)/);
      expect(match).toBeTruthy();
      const token = match![1];

      const meRes = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(meRes.statusCode).toBe(200);
      const me = JSON.parse(meRes.payload) as { userId: string; role: string };
      expect(me).toEqual({ userId: "alice@dev.local", role: "mentor" });
    });

    it("GET /mentor/feed returns 401 without token", async () => {
      const res = await app.inject({ method: "GET", url: "/mentor/feed" });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("unauthorized");
    });

    it("GET /mentor/feed returns 403 for student", async () => {
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const res = await app.inject({
        method: "GET",
        url: "/mentor/feed",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("forbidden");
    });

    it("GET /mentor/feed returns only tagged requests for mentor", async () => {
      const taggedTitle = `Mentor tagged ${Date.now()}`;
      const plainTitle = `Mentor plain ${Date.now()}`;
      const bobToken = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const bobHeaders = { authorization: `Bearer ${bobToken}` };

      await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: bobHeaders,
        payload: { title: taggedTitle, tags: ["mentor"] },
      });
      await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: bobHeaders,
        payload: { title: plainTitle },
      });

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const res = await app.inject({
        method: "GET",
        url: "/mentor/feed",
        headers: { authorization: `Bearer ${aliceToken}` },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        items: Array<{ title: string; responseCount: number }>;
      };
      expect(body.items.some((i) => i.title === taggedTitle)).toBe(true);
      expect(body.items.some((i) => i.title === plainTitle)).toBe(false);
      for (const item of body.items) {
        expect(typeof item.responseCount).toBe("number");
      }
    });

    it("GET /mentor/feed sets hasUnreadForMentor when last response is not from mentor", async () => {
      const title = `Mentor unread ${Date.now()}`;
      const bobToken = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { title, tags: ["mentor"] },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as {
        item: { id: string };
      };

      await app.inject({
        method: "POST",
        url: `/help-requests/${created.item.id}/responses`,
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { body: "Réponse étudiant en attente de mentor." },
      });

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const feedRes = await app.inject({
        method: "GET",
        url: "/mentor/feed",
        headers: { authorization: `Bearer ${aliceToken}` },
      });
      expect(feedRes.statusCode).toBe(200);
      const feed = JSON.parse(feedRes.payload) as {
        items: Array<{
          id: string;
          responseCount: number;
          lastResponseAt: string | null;
          hasUnreadForMentor: boolean;
        }>;
      };
      const item = feed.items.find((i) => i.id === created.item.id);
      expect(item).toBeDefined();
      expect(item?.responseCount).toBe(1);
      expect(item?.lastResponseAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(item?.hasUnreadForMentor).toBe(true);

      await app.inject({
        method: "POST",
        url: `/help-requests/${created.item.id}/responses`,
        headers: { authorization: `Bearer ${aliceToken}` },
        payload: { body: "Réponse mentor — lu pour le dashboard." },
      });

      const feedAfterRes = await app.inject({
        method: "GET",
        url: "/mentor/feed",
        headers: { authorization: `Bearer ${aliceToken}` },
      });
      const feedAfter = JSON.parse(feedAfterRes.payload) as {
        items: Array<{ id: string; hasUnreadForMentor: boolean }>;
      };
      const itemAfter = feedAfter.items.find((i) => i.id === created.item.id);
      expect(itemAfter?.hasUnreadForMentor).toBe(false);
    });

    it("POST /help-requests with title only remains backward compatible", async () => {
      const title = `Compat title only ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload) as { item: { title: string; body?: string } };
      expect(body.item.title).toBe(title);
      expect(body.item.body).toBeUndefined();
    });

    it("POST /help-requests accepts enriched body and subject", async () => {
      const subjectsRes = await app.inject({ method: "GET", url: "/subjects" });
      expect(subjectsRes.statusCode).toBe(200);
      const subjects = JSON.parse(subjectsRes.payload) as {
        items: Array<{ id: string; slug: string }>;
      };
      const react = subjects.items.find((s) => s.slug === "react");
      expect(react).toBeDefined();

      const title = `Enriched post ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: {
          title,
          body: "Détail du problème React hooks.",
          codeSnippet: "useEffect(() => {}, [])",
          codeLanguage: "javascript",
          subjectId: react!.id,
          urgent: true,
          tags: ["react"],
        },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as {
        item: {
          id: string;
          body?: string;
          subject?: { slug: string };
          urgent?: boolean;
        };
      };
      expect(created.item.body).toBe("Détail du problème React hooks.");
      expect(created.item.subject?.slug).toBe("react");
      expect(created.item.urgent).toBe(true);

      const detailRes = await app.inject({
        method: "GET",
        url: `/help-requests/${created.item.id}`,
      });
      expect(detailRes.statusCode).toBe(200);
      const detail = JSON.parse(detailRes.payload) as {
        item: { body?: string; responsesCount?: number };
      };
      expect(detail.item.body).toBe("Détail du problème React hooks.");
    });

    it("GET /feed filters by subject slug", async () => {
      const subjectsRes = await app.inject({ method: "GET", url: "/subjects" });
      const subjects = JSON.parse(subjectsRes.payload) as {
        items: Array<{ id: string; slug: string }>;
      };
      const rails = subjects.items.find((s) => s.slug === "rails");
      expect(rails).toBeDefined();

      const title = `Rails filter ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, subjectId: rails!.id },
      });

      const feedRes = await app.inject({
        method: "GET",
        url: "/feed?subject=rails",
      });
      expect(feedRes.statusCode).toBe(200);
      const feed = JSON.parse(feedRes.payload) as { items: Array<{ title: string }> };
      expect(feed.items.some((i) => i.title === title)).toBe(true);

      const otherFeed = await app.inject({
        method: "GET",
        url: "/feed?subject=javascript",
      });
      const other = JSON.parse(otherFeed.payload) as { items: Array<{ title: string }> };
      expect(other.items.some((i) => i.title === title)).toBe(false);
    });

    it("GET /subjects returns seeded catalogue", async () => {
      const res = await app.inject({ method: "GET", url: "/subjects" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as { items: Array<{ slug: string }> };
      expect(body.items.some((s) => s.slug === "react")).toBe(true);
    });

    it("POST /help-requests/:id/help-mentor sets flag visible in mentor feed", async () => {
      const title = `Help mentor ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title },
      });
      expect(createRes.statusCode).toBe(201);
      const created = JSON.parse(createRes.payload) as { item: { id: string } };

      const helpRes = await app.inject({
        method: "POST",
        url: `/help-requests/${created.item.id}/help-mentor`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(helpRes.statusCode).toBe(200);
      const updated = JSON.parse(helpRes.payload) as {
        item: { mentorHelpRequested?: boolean };
      };
      expect(updated.item.mentorHelpRequested).toBe(true);

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const mentorFeed = await app.inject({
        method: "GET",
        url: "/mentor/feed",
        headers: { authorization: `Bearer ${aliceToken}` },
      });
      const feed = JSON.parse(mentorFeed.payload) as {
        items: Array<{ title: string; mentorHelpRequested?: boolean }>;
      };
      expect(feed.items.some((i) => i.title === title)).toBe(true);
    });

    it("PATCH /help-requests/:id allows author to update body", async () => {
      const title = `Patch author ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${token}` },
        payload: { title, body: "Version initiale" },
      });
      const created = JSON.parse(createRes.payload) as { item: { id: string } };

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/help-requests/${created.item.id}`,
        headers: { authorization: `Bearer ${token}` },
        payload: { body: "Version corrigée" },
      });
      expect(patchRes.statusCode).toBe(200);
      const patched = JSON.parse(patchRes.payload) as { item: { body?: string } };
      expect(patched.item.body).toBe("Version corrigée");
    });

    it("PATCH /help-requests/:id returns 403 for non-author", async () => {
      const title = `Patch forbidden ${Date.now()}`;
      const bobToken = app.jwt.sign({ sub: "bob@dev.local", role: "student" });
      const createRes = await app.inject({
        method: "POST",
        url: "/help-requests",
        headers: { authorization: `Bearer ${bobToken}` },
        payload: { title },
      });
      const created = JSON.parse(createRes.payload) as { item: { id: string } };

      const aliceToken = app.jwt.sign({
        sub: "alice@dev.local",
        role: "mentor",
      });
      const patchRes = await app.inject({
        method: "PATCH",
        url: `/help-requests/${created.item.id}`,
        headers: { authorization: `Bearer ${aliceToken}` },
        payload: { body: "Tentative mentor" },
      });
      expect(patchRes.statusCode).toBe(403);
    });
  },
);

describe("OpenAPI", () => {
  const openapiPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "openapi.yaml",
  );

  it("openapi.yaml describes GET /feed as FeedResponse", () => {
    const spec = parseYaml(readFileSync(openapiPath, "utf8")) as {
      paths: Record<
        string,
        { get?: { responses?: { "200"?: { content?: unknown } } } }
      >;
      components: { schemas: Record<string, unknown> };
    };
    const feedGet = spec.paths["/feed"]?.get;
    expect(feedGet).toBeDefined();
    const schemaRef = (
      feedGet?.responses?.["200"]?.content as {
        "application/json"?: { schema?: { $ref?: string } };
      }
    )?.["application/json"]?.schema?.$ref;
    expect(schemaRef).toBe("#/components/schemas/FeedResponse");
    expect(spec.components.schemas.FeedResponse).toBeDefined();
  });

  it("serves Swagger UI at /docs when docs are enabled", async () => {
    const prevAppEnv = process.env.APP_ENV;
    delete process.env.APP_ENV;
    const app = await buildApp({ pool: null });
    try {
      expect(isOpenApiDocsEnabled()).toBe(true);
      const res = await app.inject({ method: "GET", url: "/docs" });
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toMatch(/text\/html/);
    } finally {
      if (prevAppEnv !== undefined) {
        process.env.APP_ENV = prevAppEnv;
      }
      await app.close();
    }
  });

  it("does not expose /docs when APP_ENV is production", async () => {
    const prevAppEnv = process.env.APP_ENV;
    process.env.APP_ENV = "production";
    const app = await buildApp({ pool: null });
    try {
      expect(isOpenApiDocsEnabled()).toBe(false);
      const res = await app.inject({ method: "GET", url: "/docs" });
      expect(res.statusCode).toBe(404);
    } finally {
      if (prevAppEnv !== undefined) {
        process.env.APP_ENV = prevAppEnv;
      } else {
        delete process.env.APP_ENV;
      }
      await app.close();
    }
  });
});
