import { describe, it, expect } from "vitest";
import { evaluateModeration } from "./moderation-evaluate.js";

function mockFetch(response: {
  ok: boolean;
  body?: unknown;
}): typeof fetch {
  return (async () =>
    ({
      ok: response.ok,
      json: async () => response.body,
    }) as Response) as typeof fetch;
}

describe("evaluateModeration", () => {
  it("returns flagged=true without API key (conservative stub)", async () => {
    const flagged = await evaluateModeration("putain de bug react", {
      anthropicApiKey: "",
    });
    expect(flagged).toBe(true);
  });

  it("returns flagged=true when Anthropic responds OUI", async () => {
    const flagged = await evaluateModeration("insulte grave", {
      anthropicApiKey: "test-key",
      fetchFn: mockFetch({
        ok: true,
        body: { content: [{ text: "OUI" }] },
      }),
    });
    expect(flagged).toBe(true);
  });

  it("returns flagged=false when Anthropic responds NON", async () => {
    const flagged = await evaluateModeration("frustration technique", {
      anthropicApiKey: "test-key",
      fetchFn: mockFetch({
        ok: true,
        body: { content: [{ text: "NON" }] },
      }),
    });
    expect(flagged).toBe(false);
  });

  it("returns flagged=true when Anthropic API errors", async () => {
    const flagged = await evaluateModeration("contenu limite", {
      anthropicApiKey: "test-key",
      fetchFn: mockFetch({ ok: false }),
    });
    expect(flagged).toBe(true);
  });

  it("returns flagged=true when Anthropic returns empty content", async () => {
    const flagged = await evaluateModeration("contenu limite", {
      anthropicApiKey: "test-key",
      fetchFn: mockFetch({ ok: true, body: { content: [] } }),
    });
    expect(flagged).toBe(true);
  });

  it("sends prompt truncated to 1000 chars", async () => {
    const longContent = "a".repeat(1500);
    let capturedBody: { messages?: Array<{ content: string }> } = {};
    const fetchFn = (async (_url, init) => {
      capturedBody = JSON.parse(String(init?.body));
      return {
        ok: true,
        json: async () => ({ content: [{ text: "NON" }] }),
      } as Response;
    }) as typeof fetch;

    await evaluateModeration(longContent, {
      anthropicApiKey: "test-key",
      fetchFn,
    });

    const prompt = capturedBody.messages?.[0]?.content ?? "";
    expect(prompt).toContain("a".repeat(1000));
    expect(prompt).not.toContain("a".repeat(1001));
  });
});
