import { describe, it, expect, vi, beforeEach } from "vitest";

const { startRegistration, startAuthentication } = vi.hoisted(() => ({
  startRegistration: vi.fn(),
  startAuthentication: vi.fn(),
}));

vi.mock("@simplewebauthn/browser", () => ({
  startRegistration,
  startAuthentication,
}));

import {
  fetchPasskeyLoginOptions,
  loginWithPasskey,
  registerPasskey,
  verifyPasskeyLoginResponse,
} from "@/lib/passkey-auth";

describe("passkey-auth", () => {
  beforeEach(() => {
    startRegistration.mockReset();
    startAuthentication.mockReset();
  });

  it("fetchPasskeyLoginOptions returns options from BFF", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ options: { challenge: "abc" } }),
      }),
    );

    const fetchMock = vi.mocked(fetch);

    const options = await fetchPasskeyLoginOptions();
    expect(options).toEqual({ challenge: "abc" });
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/passkey/login/options", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: "{}",
    });
  });

  it("registerPasskey runs options → WebAuthn → verify", async () => {
    const registrationResponse = { id: "cred-1", response: {} };
    startRegistration.mockResolvedValue(registrationResponse);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ options: { challenge: "reg" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            ok: true,
            verified: true,
            userId: "user-1",
            role: "student",
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await registerPasskey({
      fullName: "Bob",
      acceptCgu: true,
    });

    expect(startRegistration).toHaveBeenCalled();
    expect(result.userId).toBe("user-1");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("loginWithPasskey runs options → WebAuthn → verify", async () => {
    const authResponse = { id: "cred-1", response: {} };
    startAuthentication.mockResolvedValue(authResponse);

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ options: { challenge: "auth" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            ok: true,
            verified: true,
            userId: "user-2",
            role: "mentor",
          }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await loginWithPasskey();
    expect(startAuthentication).toHaveBeenCalled();
    expect(result.role).toBe("mentor");
  });

  it("verifyPasskeyLoginResponse posts authentication to BFF", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          ok: true,
          verified: true,
          userId: "user-3",
          role: "student",
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyPasskeyLoginResponse({
      id: "cred",
      rawId: "cred",
      response: {},
      clientExtensionResults: {},
      type: "public-key",
    });

    expect(result.userId).toBe("user-3");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/passkey/login/verify",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
