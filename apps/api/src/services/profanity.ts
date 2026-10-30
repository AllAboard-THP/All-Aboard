import { eq } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { denylistPatterns } from "../db/schema.js";
import {
  createAgentModerationEvaluator,
  type EvaluateModerationFn,
} from "../agent/moderation.js";

/** Aligné thp-final `AiModerationService` — regex local + second avis agent si match. */
const BANNED_REGEX =
  /\b(connard|connasse|enculé|putain|salope|pute|fdp|ntm|nique|fuck|shit|bitch|asshole|nigger|cunt)\b/i;

export function matchesBannedRegex(content: string): boolean {
  return BANNED_REGEX.test(content);
}

function matchesPattern(pattern: string, content: string): boolean {
  try {
    return new RegExp(pattern, "i").test(content);
  } catch {
    return false;
  }
}

export function isValidRegexPattern(pattern: string): boolean {
  try {
    void RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export async function loadActiveDenylistPatterns(
  db: AppDatabase,
): Promise<Array<{ pattern: string }>> {
  return db
    .select({ pattern: denylistPatterns.pattern })
    .from(denylistPatterns)
    .where(eq(denylistPatterns.active, true));
}

export function isModerationClaudeEnabled(): boolean {
  const raw = process.env.MODERATION_CLAUDE_ENABLED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return true;
}

/** Première passe locale (regex + denylist) — aligné `AiModerationService#fallback_check`. */
export async function matchesLocalModerationRules(
  db: AppDatabase,
  content: string,
): Promise<boolean> {
  const trimmed = content.trim();
  if (!trimmed) return false;
  if (matchesBannedRegex(trimmed)) return true;

  const patterns = await loadActiveDenylistPatterns(db);
  return patterns.some((row) => matchesPattern(row.pattern, trimmed));
}

export async function contentShouldBeFlagged(
  db: AppDatabase,
  content: string,
  evaluateModeration?: EvaluateModerationFn,
): Promise<boolean> {
  const trimmed = content.trim();
  if (!trimmed) return false;

  const localHit = await matchesLocalModerationRules(db, trimmed);
  if (!localHit) return false;

  if (!isModerationClaudeEnabled()) {
    return true;
  }

  const evaluate = evaluateModeration ?? createAgentModerationEvaluator();
  return evaluate(trimmed);
}

/** Concatène les champs texte d'une demande ou réponse pour modération. */
export function moderationContentFromFields(
  fields: Array<string | null | undefined>,
): string {
  return fields
    .map((f) => (f ?? "").trim())
    .filter((s) => s.length > 0)
    .join("\n");
}
