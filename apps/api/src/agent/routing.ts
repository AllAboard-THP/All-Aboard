import type {
  AgentRoutingEvaluateBody,
  AgentRoutingEvaluateResponse,
} from "@allaboard/types";

/** Aligné stub agent — fallback si `AGENT_URL` absent ou indisponible. */
export const RUBBERDUCK_REDIRECT_WORD_THRESHOLD = 6;

const DEFAULT_AGENT_TIMEOUT_MS = 2_000;

export function evaluateRoutingFallback(
  body: AgentRoutingEvaluateBody,
): AgentRoutingEvaluateResponse {
  const wc = body.title.trim().split(/\s+/).filter(Boolean).length;
  const suggestRubberduckRedirect =
    wc <= RUBBERDUCK_REDIRECT_WORD_THRESHOLD;
  return {
    suggestRubberduckRedirect,
    ...(suggestRubberduckRedirect
      ? { reason: `fallback_title_word_count_${wc}` }
      : {}),
  };
}

export type EvaluateRoutingFn = (
  body: AgentRoutingEvaluateBody,
) => Promise<AgentRoutingEvaluateResponse>;

export type CreateAgentRoutingEvaluatorOptions = {
  agentUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

export function resolveAgentBaseUrl(): string {
  return (process.env.AGENT_URL?.trim() ?? "").replace(/\/$/, "");
}

export function createAgentRoutingEvaluator(
  options?: CreateAgentRoutingEvaluatorOptions,
): EvaluateRoutingFn {
  const agentUrl = options?.agentUrl ?? resolveAgentBaseUrl();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_AGENT_TIMEOUT_MS;
  const fetchFn = options?.fetchFn ?? fetch;

  return async (body) => {
    if (!agentUrl) {
      return evaluateRoutingFallback(body);
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchFn(`${agentUrl}/routing/evaluate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) {
          return evaluateRoutingFallback(body);
        }
        const data = (await res.json()) as AgentRoutingEvaluateResponse;
        if (typeof data.suggestRubberduckRedirect !== "boolean") {
          return evaluateRoutingFallback(body);
        }
        return data;
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return evaluateRoutingFallback(body);
    }
  };
}
