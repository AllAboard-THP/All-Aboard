import { describe, it, expect } from "vitest";
import { buildApp } from "./app.js";

describe("agent", () => {
  it("GET /health returns 200", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: "ok" });
    await app.close();
  });

  it("POST /routing/evaluate suggests Rubberduck redirect for short titles", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/routing/evaluate",
      payload: { title: "fix react hook" },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      suggestRubberduckRedirect: boolean;
      reason?: string;
    };
    expect(body.suggestRubberduckRedirect).toBe(true);
    expect(body.reason).toContain("title_word_count");
    await app.close();
  });

  it("POST /routing/evaluate does not suggest redirect for long titles", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/routing/evaluate",
      payload: {
        title: "how do I structure a large monorepo with many packages",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      suggestRubberduckRedirect: boolean;
      reason?: string;
    };
    expect(body.suggestRubberduckRedirect).toBe(false);
    expect(body.reason).toBeUndefined();
    await app.close();
  });

  it("POST /routing/evaluate returns 400 for invalid body", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/routing/evaluate",
      payload: { title: "" },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload)).toEqual({ error: "invalid_body" });
    await app.close();
  });
});
