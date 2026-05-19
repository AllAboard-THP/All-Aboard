import pg from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApp } from "./app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    it("POST /auth/login rejects wrong password", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: { userId: "bob", password: "wrong" },
      });
      expect(res.statusCode).toBe(401);
    });

    it("POST /help-requests returns 401 without token", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/help-requests",
        payload: { title: "Need help with tests" },
      });
      expect(res.statusCode).toBe(401);
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
  },
);
