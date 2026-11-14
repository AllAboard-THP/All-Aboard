import type {
  AgentTagsSuggestBody,
  AgentTagsSuggestResponse,
  SuggestTagsBody,
} from "@allaboard/types";
import { resolveAgentBaseUrl } from "./routing.js";

const DEFAULT_AGENT_TIMEOUT_MS = 3_000;

function stubSuggestTags(body: SuggestTagsBody): AgentTagsSuggestResponse {
  const title = body.title?.trim();
  const text = body.body?.trim();
  if (!title && !text) return { tags: [] };
  const words =
    `${title ?? ""} ${text ?? ""}`
      .toLowerCase()
      .match(/[a-z]{4,}/g) ?? [];
  const unique = [...new Set(words)].slice(0, 5);
  return { tags: unique };
}

export type SuggestTagsFn = (
  body: SuggestTagsBody,
) => Promise<AgentTagsSuggestResponse>;

export function createTagSuggestionEvaluator(options?: {
  agentUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
}): SuggestTagsFn {
  const agentUrl = options?.agentUrl ?? resolveAgentBaseUrl();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_AGENT_TIMEOUT_MS;
  const fetchFn = options?.fetchFn ?? fetch;

  return async (body) => {
    if (!agentUrl) {
      return stubSuggestTags(body);
    }
    const payload: AgentTagsSuggestBody = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
    };
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchFn(`${agentUrl}/tags/suggest`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!res.ok) return stubSuggestTags(body);
        const data = (await res.json()) as AgentTagsSuggestResponse;
        if (!Array.isArray(data.tags)) return stubSuggestTags(body);
        return { tags: data.tags.map((t) => String(t).trim()).filter(Boolean) };
      } finally {
        clearTimeout(timer);
      }
    } catch {
      return stubSuggestTags(body);
    }
  };
}
