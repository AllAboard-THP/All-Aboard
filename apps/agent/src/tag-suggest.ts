import { z } from "zod";

export const tagsSuggestBodySchema = z.object({
  title: z.string().max(500).optional(),
  body: z.string().max(50_000).optional(),
});

const STOPWORDS = new Set([
  "about",
  "avec",
  "cette",
  "comme",
  "dans",
  "depuis",
  "dont",
  "être",
  "fait",
  "pour",
  "sont",
  "that",
  "the",
  "this",
  "une",
  "des",
  "les",
  "est",
  "plus",
  "tout",
]);

/** Stub aligné Rails quand pas de clé LLM — mots techniques ≥ 5 lettres. */
export function suggestTagsFallback(
  title?: string,
  body?: string,
): string[] {
  const text = `${title ?? ""} ${body ?? ""}`.toLowerCase();
  if (!text.trim()) return [];
  const words =
    text.match(/[a-zàâçéèêëîïôùûü0-9][a-zàâçéèêëïîôùûü0-9/_-]{3,}/g) ?? [];
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of words) {
    const w = raw.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "");
    if (w.length < 4 || STOPWORDS.has(w) || seen.has(w)) continue;
    seen.add(w);
    tags.push(w);
    if (tags.length >= 5) break;
  }
  return tags;
}
