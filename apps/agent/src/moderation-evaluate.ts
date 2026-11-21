import { z } from "zod";

export const moderationEvaluateBodySchema = z.object({
  content: z.string().min(1).max(50_000),
});

/** Aligné thp-final `AiModerationService::SYSTEM_PROMPT`. */
const SYSTEM_PROMPT = `Tu es un modérateur de contenu pour une plateforme d'entraide entre développeurs.
Réponds uniquement par "OUI" ou "NON".
"OUI" si le contenu contient : insultes, propos haineux, spam, contenu offensant ou inapproprié.
"NON" si le contenu est acceptable (même s'il contient du code, des erreurs techniques, ou des frustrations légères).`;

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export type ModerationEvaluateDeps = {
  anthropicApiKey?: string;
  fetchFn?: typeof fetch;
};

type AnthropicMessagesResponse = {
  content?: Array<{ text?: string }>;
};

/**
 * Second avis Claude sur un contenu déjà détecté par regex/denylist côté API.
 * Sans clé API : conservateur (flagged=true), aligné Rails quand `response.nil?`.
 */
export async function evaluateModeration(
  content: string,
  deps: ModerationEvaluateDeps = {},
): Promise<boolean> {
  const apiKey = deps.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    return true;
  }

  const fetchFn = deps.fetchFn ?? fetch;
  const prompt = `Ce contenu doit-il être modéré ?\n\n${content.slice(0, 1000)}`;

  try {
    const response = await fetchFn(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 10,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return true;
    }

    const data = (await response.json()) as AnthropicMessagesResponse;
    const text = data.content?.[0]?.text;
    if (!text) {
      return true;
    }

    return text.trim().toUpperCase().startsWith("OUI");
  } catch {
    return true;
  }
}
