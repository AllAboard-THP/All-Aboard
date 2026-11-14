import { z } from "zod";

export const summaryGenerateBodySchema = z.object({
  title: z.string().min(1).max(500),
  body: z.string().max(50_000).optional(),
  codeSnippet: z.string().max(50_000).optional(),
  responses: z
    .array(
      z.object({
        authorName: z.string().max(200),
        body: z.string().max(10_000),
      }),
    )
    .max(100)
    .optional(),
});

/** Stub sans LLM — format Problème / Solution (Rails-like). */
export function generateSummaryFallback(input: {
  title: string;
  body?: string;
  codeSnippet?: string;
  responses?: Array<{ authorName: string; body: string }>;
}): string {
  const problem = [input.title, input.body?.trim()].filter(Boolean).join(" — ");
  const lastResponse = input.responses?.at(-1);
  const solution = lastResponse
    ? `${lastResponse.authorName} : ${lastResponse.body.trim().slice(0, 300)}`
    : "Aucune réponse enregistrée.";
  const codeNote = input.codeSnippet?.trim()
    ? " Un extrait de code accompagnait la demande."
    : "";
  return `Problème : ${problem}.${codeNote} Solution : ${solution}`;
}
