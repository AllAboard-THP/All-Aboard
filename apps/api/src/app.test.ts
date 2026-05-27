import pg from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import { buildApp } from "./app";
import { isOpenApiDocsEnabled } from "./openapi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mvpPassword = process.env.MVP_LOGIN_PASSWORD;

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

  it("POST /auth/login returns 503 when MVP_LOGIN_PASSWORD is unset", async () => {
    const prev = process.env.MVP_LOGIN_PASSWORD;
    delete process.env.MVP_LOGIN_PASSWORD;
    const app = await buildApp({ pool: null });
    try {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "bob", password: "any" },
      });
      expect(res.statusCode).toBe(503);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("login_not_configured");
    } finally {
      if (prev !== undefined) {
        process.env.MVP_LOGIN_PASSWORD = prev;
      }
      await app.close();
    }
  });

  it("POST /auth/login sets Secure cookie when NODE_ENV is production", async () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevJwt = process.env.JWT_SECRET;
    const prevPassword = process.env.MVP_LOGIN_PASSWORD;
    process.env.NODE_ENV = "production";
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

describe.skipIf(!process.env.DATABASE_URL || !process.env.MVP_LOGIN_PASSWORD)(
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
      app = await buildApp({ pool });
    });

    afterAll(async () => {
      await app.close();
      await pool.end();
    });

    it("GET /feed returns 200 with items array", async () => {
      const res = await app.inject({ method: "GET", url: "/feed" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as { items: unknown[] };
      expect(Array.isArray(body.items)).toBe(true);
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
        payload: { userId: "bob", password: "wrong" },
      });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload) as { error: string };
      expect(body.error).toBe("invalid_credentials");
    });

    it("POST /auth/login succeeds and sets access_token cookie", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "bob", password: mvpPassword },
      });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        ok: boolean;
        userId: string;
        role: string;
      };
      expect(body).toEqual({ ok: true, userId: "bob", role: "student" });
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

    it("GET /auth/me returns role for mentor userId alice on login", async () => {
      const loginRes = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "alice", password: mvpPassword },
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
      expect(me).toEqual({ userId: "alice", role: "mentor" });
    });

    it("GET /mentor/feed returns only tagged requests", async () => {
      const taggedTitle = `Mentor tagged ${Date.now()}`;
      const plainTitle = `Mentor plain ${Date.now()}`;
      const token = app.jwt.sign({ sub: "bob", role: "student" });
      const headers = { authorization: `Bearer ${token}` };

      await app.inject({
        method: "POST",
        url: "/help-requests",
        headers,
        payload: { title: taggedTitle, tags: ["mentor"] },
      });
      await app.inject({
        method: "POST",
        url: "/help-requests",
        headers,
        payload: { title: plainTitle },
      });

      const res = await app.inject({ method: "GET", url: "/mentor/feed" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as {
        items: Array<{ title: string }>;
      };
      expect(body.items.some((i) => i.title === taggedTitle)).toBe(true);
      expect(body.items.some((i) => i.title === plainTitle)).toBe(false);
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
