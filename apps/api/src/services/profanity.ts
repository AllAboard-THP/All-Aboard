import { eq } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { denylistPatterns } from "../db/schema.js";

/** Aligné thp-final `AiModerationService` — regex local uniquement (pas d'appel Claude). */
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

export async function contentShouldBeFlagged(
  db: AppDatabase,
  content: string,
): Promise<boolean> {
  const trimmed = content.trim();
  if (!trimmed) return false;
  if (matchesBannedRegex(trimmed)) return true;

  const patterns = await loadActiveDenylistPatterns(db);
  return patterns.some((row) => matchesPattern(row.pattern, trimmed));
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
