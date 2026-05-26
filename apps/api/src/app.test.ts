import pg from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mvpPassword = process.env.MVP_LOGIN_PASSWORD;

describe("api", () => {
  it("GET /health returns 200", async () => {
    const app = buildApp({ pool: null });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: "ok" });
    await app.close();
  });

  it("GET /feed returns 503 when database is not configured", async () => {
    const app = buildApp({ pool: null });
    const res = await app.inject({ method: "GET", url: "/feed" });
    expect(res.statusCode).toBe(503);
    const body = JSON.parse(res.payload) as { error: string };
    expect(body.error).toBe("database_unavailable");
    await app.close();
  });

  it("POST /auth/login returns 503 when MVP_LOGIN_PASSWORD is unset", async () => {
    const prev = process.env.MVP_LOGIN_PASSWORD;
    delete process.env.MVP_LOGIN_PASSWORD;
    const app = buildApp({ pool: null });
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

  it("POST /help-requests returns 503 when database is not configured", async () => {
    const app = buildApp({ pool: null });
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

describe.skipIf(!process.env.DATABASE_URL || !process.env.MVP_LOGIN_PASSWORD)(
  "api with database",
  () => {
    let pool: pg.Pool;
    let app: ReturnType<typeof buildApp>;

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      const db = drizzle(pool);
      await migrate(db, {
        migrationsFolder: path.join(__dirname, "../drizzle"),
      });
      app = buildApp({ pool });
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
