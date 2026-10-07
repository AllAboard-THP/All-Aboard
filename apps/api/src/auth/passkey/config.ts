const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function webauthnRpId(): string {
  const configured = process.env.WEBAUTHN_RP_ID?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("WEBAUTHN_RP_ID is required in production");
  }
  return "localhost";
}

export function webauthnRpName(): string {
  return process.env.WEBAUTHN_RP_NAME?.trim() || "All-Aboard";
}

export function webauthnOrigins(): string[] {
  const raw = process.env.WEBAUTHN_ORIGINS?.trim();
  if (raw) {
    return raw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("WEBAUTHN_ORIGINS is required in production");
  }
  return ["http://localhost:3000", "http://127.0.0.1:3000"];
}

export function challengeTtlMs(): number {
  return 5 * 60 * 1000;
}
