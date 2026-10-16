import { describe, expect, it, vi } from "vitest";
import {
  createAgentModerationEvaluator,
  moderationEvaluateFallback,
} from "./moderation";

describe("agent moderation", () => {
  it("moderationEvaluateFallback flags content conservatively", () => {
    expect(moderationEvaluateFallback()).toBe(true);
  });

  it("createAgentModerationEvaluator uses fallback when AGENT_URL is unset", async () => {
    const evaluate = createAgentModerationEvaluator({ agentUrl: "" });
    await expect(evaluate("some flagged content")).resolves.toBe(true);
  });

  it("createAgentModerationEvaluator calls agent and maps response", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ flagged: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const evaluate = createAgentModerationEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    const result = await evaluate("what the fuck");
    expect(fetchFn).toHaveBeenCalledWith(
      "http://127.0.0.1:4100/moderation/evaluate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "what the fuck" }),
      }),
    );
    expect(result).toBe(false);
  });

  it("createAgentModerationEvaluator falls back when agent errors", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const evaluate = createAgentModerationEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    await expect(evaluate("bad word")).resolves.toBe(true);
  });

  it("createAgentModerationEvaluator falls back on invalid agent payload", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ unexpected: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const evaluate = createAgentModerationEvaluator({
      agentUrl: "http://127.0.0.1:4100",
      fetchFn,
    });
    await expect(evaluate("bad word")).resolves.toBe(true);
  });
});
