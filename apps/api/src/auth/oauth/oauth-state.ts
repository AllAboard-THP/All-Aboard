import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { jwtSecret } from "../../lib/auth-helpers.js";

export type PkcePair = {
  codeVerifier: string;
  codeChallenge: string;
};

export function generatePkcePair(): PkcePair {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

type OAuthStatePayload = {
  cv: string;
  n: string;
  exp: number;
};

const STATE_TTL_MS = 10 * 60 * 1000;

export function createOAuthState(codeVerifier: string): string {
  const payload: OAuthStatePayload = {
    cv: codeVerifier,
    n: randomBytes(16).toString("base64url"),
    exp: Date.now() + STATE_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", jwtSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function parseOAuthState(
  state: string,
): { codeVerifier: string } | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) return null;
  const encoded = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", jwtSecret())
    .update(encoded)
    .digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as OAuthStatePayload;
    if (
      typeof payload.cv !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    return { codeVerifier: payload.cv };
  } catch {
    return null;
  }
}
