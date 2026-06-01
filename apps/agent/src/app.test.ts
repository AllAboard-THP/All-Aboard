import { describe, it, expect } from "vitest";
import { buildApp } from "./app.js";

const HELP_REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("agent", () => {
  it("GET /health returns 200", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: "ok" });
    await app.close();
  });

  it("POST /rubberduck/evaluate marks short titles eligible", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/rubberduck/evaluate",
      payload: { title: "fix react hook" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      eligible: boolean;
      reason?: string;
    };
    expect(body.eligible).toBe(true);
    expect(body.reason).toContain("title_word_count");
    await app.close();
  });

  it("POST /rubberduck/evaluate marks long titles ineligible", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/rubberduck/evaluate",
      payload: {
        title: "how do I structure a large monorepo with many packages",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { eligible: boolean; reason?: string };
    expect(body.eligible).toBe(false);
    expect(body.reason).toBeUndefined();
    await app.close();
  });

  it("POST /rubberduck/evaluate returns 400 for invalid body", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/rubberduck/evaluate",
      payload: { title: "" },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload)).toEqual({ error: "invalid_body" });
    await app.close();
  });

  it("POST /rubberduck/respond returns stub message", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/rubberduck/respond",
      payload: {
        helpRequestId: HELP_REQUEST_ID,
        title: "fix react hook",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      message: string;
      sessionId?: string;
    };
    expect(body.message).toContain("stub");
    expect(body.sessionId).toBe(`stub-${HELP_REQUEST_ID}`);
    await app.close();
  });

  it("POST /rubberduck/respond returns 400 for invalid body", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/rubberduck/respond",
      payload: { helpRequestId: "not-a-uuid", title: "x" },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload)).toEqual({ error: "invalid_body" });
    await app.close();
  });
});
