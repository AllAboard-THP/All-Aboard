const LEGACY_LOGIN_EMAIL: Record<string, string> = {
  bob: "bob@dev.local",
  alice: "alice@dev.local",
};

/** Maps short dev aliases (e.g. `bob`) to seeded MVP emails before BFF login. */
export function normalizeLoginEmail(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }
  const legacy = LEGACY_LOGIN_EMAIL[trimmed.toLowerCase()];
  return legacy ?? trimmed;
}
