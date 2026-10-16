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

  it("POST /tags/suggest returns tags for title/body", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/tags/suggest",
      payload: {
        title: "React hooks useEffect",
        body: "mon composant ne se met pas à jour",
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { tags: string[] };
    expect(body.tags.length).toBeGreaterThan(0);
    expect(body.tags.length).toBeLessThanOrEqual(5);
    await app.close();
  });

  it("POST /tags/suggest returns empty tags when input blank", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/tags/suggest",
      payload: {},
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ tags: [] });
    await app.close();
  });

  it("POST /summary/generate returns stub summary", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/summary/generate",
      payload: {
        title: "Bug React",
        body: "Le state ne change pas",
        responses: [{ authorName: "Alice", body: "Utilise un callback." }],
      },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as { summary: string };
    expect(body.summary).toContain("Problème");
    expect(body.summary).toContain("Solution");
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

  it("POST /moderation/evaluate returns flagged=true without API key", async () => {
    const app = await buildApp({ moderation: { anthropicApiKey: "" } });
    const res = await app.inject({
      method: "POST",
      url: "/moderation/evaluate",
      payload: { content: "putain ce hook ne marche pas" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ flagged: true });
    await app.close();
  });

  it("POST /moderation/evaluate uses Anthropic when API key present", async () => {
    const fetchFn = (async () =>
      ({
        ok: true,
        json: async () => ({ content: [{ text: "NON" }] }),
      }) as Response) as typeof fetch;

    const app = await buildApp({
      moderation: { anthropicApiKey: "test-key", fetchFn },
    });
    const res = await app.inject({
      method: "POST",
      url: "/moderation/evaluate",
      payload: { content: "mon useEffect ne se déclenche pas" },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ flagged: false });
    await app.close();
  });

  it("POST /moderation/evaluate returns 400 for invalid body", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/moderation/evaluate",
      payload: { content: "" },
    });
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.payload)).toEqual({ error: "invalid_body" });
    await app.close();
  });
});
