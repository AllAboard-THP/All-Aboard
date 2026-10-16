import { describe, expect, it } from "vitest";
import {
  createOAuthState,
  generatePkcePair,
  parseOAuthState,
} from "./oauth-state.js";

describe("oauth-state", () => {
  it("round-trips PKCE verifier through signed state", () => {
    const { codeVerifier, codeChallenge } = generatePkcePair();
    expect(codeVerifier.length).toBeGreaterThan(20);
    expect(codeChallenge).not.toBe(codeVerifier);

    const state = createOAuthState(codeVerifier);
    const parsed = parseOAuthState(state);
    expect(parsed?.codeVerifier).toBe(codeVerifier);
  });

  it("rejects tampered state", () => {
    const { codeVerifier } = generatePkcePair();
    const state = createOAuthState(codeVerifier);
    expect(parseOAuthState(`${state}x`)).toBeNull();
    expect(parseOAuthState("not.valid")).toBeNull();
  });
});
