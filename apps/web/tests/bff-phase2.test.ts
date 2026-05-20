import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as helpRequestsPost } from "@/app/api/help-requests/route";

vi.mock("@/lib/api-server", () => ({
  getApiBaseUrl: () => "http://api.test:4000",
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("BFF Phase 2", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("POST /api/auth/login", () => {
    it("relays upstream 200 and Set-Cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.append(
        "set-cookie",
        "access_token=abc123; Path=/; HttpOnly; SameSite=Lax",
      );
      upstreamHeaders.set("content-type", "application/json");
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, userId: "bob" }), {
          status: 200,
          headers: upstreamHeaders,
        }),
      );

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ userId: "bob", password: "secret" }),
        headers: { "content-type": "application/json" },
      });
      const res = await loginPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/login",
        expect.objectContaining({ method: "POST" }),
      );
      const setCookies = res.headers.getSetCookie();
      expect(setCookies.some((c) => c.includes("access_token="))).toBe(true);
    });

    it("relays upstream 401 status", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "invalid_credentials" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ userId: "bob", password: "wrong" }),
        headers: { "content-type": "application/json" },
      });
      const res = await loginPost(req);

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/help-requests", () => {
    it("returns 401 missing_token when no cookie", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const req = new Request("http://localhost/api/help-requests", {
        method: "POST",
        body: JSON.stringify({ title: "Help" }),
        headers: { "content-type": "application/json" },
      });
      const res = await helpRequestsPost(req);

      expect(res.status).toBe(401);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe("missing_token");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer token and relays 201 body", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: (name: string) =>
          name === "access_token" ? { value: "jwt-token-xyz" } : undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const created = {
        item: {
          id: "id-1",
          title: "Help",
          authorId: "bob",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      };
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(created), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/help-requests", {
        method: "POST",
        body: JSON.stringify({ title: "Help" }),
        headers: { "content-type": "application/json" },
      });
      const res = await helpRequestsPost(req);

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-token-xyz",
          }),
        }),
      );
      const body = (await res.json()) as typeof created;
      expect(body.item.id).toBe("id-1");
    });
  });
});
