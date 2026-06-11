import type {
  AgentModerationEvaluateBody,
  AgentModerationEvaluateResponse,
} from "@allaboard/types";
import { resolveAgentBaseUrl } from "./routing.js";

const DEFAULT_MODERATION_TIMEOUT_MS = 3_000;

/** Fallback conservateur quand regex/denylist a matché mais l'agent est indisponible. */
export function moderationEvaluateFallback(): boolean {
  return true;
}

export type EvaluateModerationFn = (content: string) => Promise<boolean>;

export type CreateAgentModerationEvaluatorOptions = {
  agentUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

export function createAgentModerationEvaluator(
  options?: CreateAgentModerationEvaluatorOptions,
): EvaluateModerationFn {
  const agentUrl = options?.agentUrl ?? resolveAgentBaseUrl();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_MODERATION_TIMEOUT_MS;
  const fetchFn = options?.fetchFn ?? fetch;

  return async (content: string) => {
    if (!agentUrl) {
      return moderationEvaluateFallback();
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const body: AgentModerationEvaluateBody = { content };
        const res = await fetchFn(`${agentUrl}/moderation/evaluate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          return moderationEvaluateFallback();
        }
        const data = (await res.json()) as AgentModerationEvaluateResponse;
        if (typeof data.flagged !== "boolean") {
          return moderationEvaluateFallback();
        }
        return data.flagged;
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return moderationEvaluateFallback();
    }
  };
}
