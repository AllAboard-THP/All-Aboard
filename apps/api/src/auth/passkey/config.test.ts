import { describe, expect, it } from "vitest";
import { isUuid, webauthnOrigins, webauthnRpId, webauthnRpName } from "./config";

describe("passkey config", () => {
  it("isUuid recognizes valid uuid v4", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("bob@dev.local")).toBe(false);
    expect(isUuid("bob")).toBe(false);
  });

  it("webauthnRpId defaults to localhost in non-production", () => {
    const prev = process.env.WEBAUTHN_RP_ID;
    delete process.env.WEBAUTHN_RP_ID;
    expect(webauthnRpId()).toBe("localhost");
    if (prev !== undefined) process.env.WEBAUTHN_RP_ID = prev;
  });

  it("webauthnRpName defaults to All-Aboard", () => {
    const prev = process.env.WEBAUTHN_RP_NAME;
    delete process.env.WEBAUTHN_RP_NAME;
    expect(webauthnRpName()).toBe("All-Aboard");
    if (prev !== undefined) process.env.WEBAUTHN_RP_NAME = prev;
  });

  it("webauthnOrigins includes localhost dev URLs by default", () => {
    const prev = process.env.WEBAUTHN_ORIGINS;
    delete process.env.WEBAUTHN_ORIGINS;
    expect(webauthnOrigins()).toContain("http://localhost:3000");
    if (prev !== undefined) process.env.WEBAUTHN_ORIGINS = prev;
  });
});
