import type { AgentSummaryGenerateBody, AgentSummaryGenerateResponse } from "@allaboard/types";
import { resolveAgentBaseUrl } from "./routing.js";

const DEFAULT_AGENT_TIMEOUT_MS = 10_000;

function stubSummary(body: AgentSummaryGenerateBody): AgentSummaryGenerateResponse {
  const problem = [body.title, body.body?.trim()].filter(Boolean).join(" — ");
  const last = body.responses?.at(-1);
  const solution = last
    ? `${last.authorName} : ${last.body.trim().slice(0, 300)}`
    : "Aucune réponse enregistrée.";
  return {
    summary: `Problème : ${problem}. Solution : ${solution}`,
  };
}

export type GenerateSummaryFn = (
  body: AgentSummaryGenerateBody,
) => Promise<AgentSummaryGenerateResponse>;

export function createSummaryGenerator(options?: {
  agentUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}): GenerateSummaryFn {
  const agentUrl = options?.agentUrl ?? resolveAgentBaseUrl();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_AGENT_TIMEOUT_MS;
  const fetchFn = options?.fetchFn ?? fetch;

  return async (body) => {
    if (!agentUrl) {
      return stubSummary(body);
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchFn(`${agentUrl}/summary/generate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!res.ok) return stubSummary(body);
        const data = (await res.json()) as AgentSummaryGenerateResponse;
        if (typeof data.summary !== "string" || !data.summary.trim()) {
          return stubSummary(body);
        }
        return { summary: data.summary.trim() };
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return stubSummary(body);
    }
  };
}
