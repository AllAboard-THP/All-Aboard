import { describe, expect, it, vi } from "vitest";
import {
  createAgentRoutingEvaluator,
  evaluateRoutingFallback,
} from "./routing";

describe("agent routing", () => {
  it("evaluateRoutingFallback suggests redirect for short titles", () => {
    const result = evaluateRoutingFallback({ title: "Need help" });
    expect(result.suggestRubberduckRedirect).toBe(true);
    expect(result.reason).toMatch(/fallback/);
  });

  it("evaluateRoutingFallback omits redirect for long titles", () => {
    const result = evaluateRoutingFallback({
      title: "This is a much longer help request title",
    });
    expect(result.suggestRubberduckRedirect).toBe(false);
    expect(result.reason).toBeUndefined();
  });

  it("createAgentRoutingEvaluator uses fallback when AGENT_URL is unset", async () => {
    const evaluate = createAgentRoutingEvaluator({ agentUrl: "" });
    const result = await evaluate({ title: "Short" });
    expect(result.suggestRubberduckRedirect).toBe(true);
  });

  it("createAgentRoutingEvaluator calls agent and maps response", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ suggestRubberduckRedirect: false, reason: "agent" }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const evaluate = createAgentRoutingEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    const result = await evaluate({
      title: "Short",
      authorId: "bob@dev.local",
      tags: ["react"],
    });
    expect(fetchFn).toHaveBeenCalledWith(
      "http://127.0.0.1:4100/routing/evaluate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          title: "Short",
          authorId: "bob@dev.local",
          tags: ["react"],
        }),
      }),
    );
    expect(result.suggestRubberduckRedirect).toBe(false);
  });

  it("createAgentRoutingEvaluator falls back when agent errors", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const evaluate = createAgentRoutingEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    const result = await evaluate({ title: "Short" });
    expect(result.suggestRubberduckRedirect).toBe(true);
    expect(result.reason).toMatch(/fallback/);
  });

  it("createAgentRoutingEvaluator falls back on invalid agent payload", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const evaluate = createAgentRoutingEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    const result = await evaluate({ title: "Short" });
    expect(result.suggestRubberduckRedirect).toBe(true);
  });
});
