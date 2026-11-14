import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as googleGet } from "@/app/api/auth/google/route";
import { GET as googleCallbackGet } from "@/app/api/auth/google/callback/route";

vi.mock("@/lib/api-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-server")>();
  return {
    ...actual,
    getApiBaseUrl: () => "http://api.test:4000",
  };
});

describe("BFF OAuth", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/auth/google", () => {
    it("relays upstream redirect and Set-Cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.set("location", "https://accounts.google.com/o/oauth2/v2/auth");
      upstreamHeaders.append(
        "set-cookie",
        "oauth_state=abc; Path=/; HttpOnly",
      );
      fetchMock.mockResolvedValueOnce(
        new Response(null, { status: 302, headers: upstreamHeaders }),
      );

      const res = await googleGet();
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toContain("accounts.google.com");
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/google",
        expect.objectContaining({ redirect: "manual" }),
      );
    });
  });

  describe("GET /api/auth/google/callback", () => {
    it("forwards query string and relays redirect + access_token cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.set("location", "http://localhost:3000/onboarding");
      upstreamHeaders.append(
        "set-cookie",
        "access_token=jwt123; Path=/; HttpOnly; SameSite=Lax",
      );
      fetchMock.mockResolvedValueOnce(
        new Response(null, { status: 302, headers: upstreamHeaders }),
      );

      const req = new Request(
        "http://localhost/api/auth/google/callback?code=abc&state=xyz",
      );
      const res = await googleCallbackGet(req);

      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("http://localhost:3000/onboarding");
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/google/callback?code=abc&state=xyz",
        expect.objectContaining({ redirect: "manual" }),
      );
      const setCookies = res.headers.getSetCookie();
      expect(setCookies.some((c) => c.includes("access_token="))).toBe(true);
    });
  });
});
