import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { PATCH as usersMePatch } from "@/app/api/users/me/route";
import { POST as legalAcceptPost } from "@/app/api/legal/accept/route";
import { GET as userByIdGet } from "@/app/api/users/[id]/route";

vi.mock("@/lib/api-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-server")>();
  return {
    ...actual,
    getApiBaseUrl: () => "http://api.test:4000",
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("BFF Phase 3 auth & profiles", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("POST /api/auth/register", () => {
    it("relays upstream 200 and Set-Cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.append(
        "set-cookie",
        "access_token=newjwt; Path=/; HttpOnly; SameSite=Lax",
      );
      upstreamHeaders.set("content-type", "application/json");
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            userId: "new@dev.local",
            role: "student",
          }),
          { status: 200, headers: upstreamHeaders },
        ),
      );

      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@dev.local",
          password: "secure-pass-1",
          fullName: "New User",
          acceptCgu: true,
        }),
        headers: { "content-type": "application/json" },
      });
      const res = await registerPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/register",
        expect.objectContaining({ method: "POST" }),
      );
      expect(res.headers.getSetCookie().some((c) => c.includes("access_token="))).toBe(
        true,
      );
    });

    it("relays upstream 409 email_taken", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "email_taken" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "bob@dev.local",
          password: "secure-pass-1",
          fullName: "Bob",
          acceptCgu: true,
        }),
        headers: { "content-type": "application/json" },
      });
      const res = await registerPost(req);
      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("relays upstream 200 and clears cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.append(
        "set-cookie",
        "access_token=; Path=/; HttpOnly; Max-Age=0",
      );
      upstreamHeaders.set("content-type", "application/json");
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: upstreamHeaders,
        }),
      );

      const res = await logoutPost();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/logout",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("PATCH /api/users/me", () => {
    it("returns 401 missing_token when no cookie", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const req = new Request("http://localhost/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ bio: "Hello" }),
        headers: { "content-type": "application/json" },
      });
      const res = await usersMePatch(req);
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays 200", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: (name: string) =>
          name === "access_token" ? { value: "jwt-bob" } : undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "uuid-1",
              email: "bob@dev.local",
              role: "student",
              displayName: "Bob",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-02T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const req = new Request("http://localhost/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ bio: "Étudiant" }),
        headers: { "content-type": "application/json" },
      });
      const res = await usersMePatch(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/users/me",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });
  });

  describe("POST /api/legal/accept", () => {
    it("forwards Bearer and relays cguAcceptedAt", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: (name: string) =>
          name === "access_token" ? { value: "jwt-bob" } : undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            cguAcceptedAt: "2026-06-04T12:00:00.000Z",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await legalAcceptPost();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/legal/accept",
        expect.objectContaining({
          method: "POST",
          headers: { authorization: "Bearer jwt-bob" },
        }),
      );
      const body = (await res.json()) as { cguAcceptedAt: string };
      expect(body.cguAcceptedAt).toBe("2026-06-04T12:00:00.000Z");
    });
  });

  describe("GET /api/users/:id", () => {
    it("relays query string to upstream public profile", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            profile: {
              id: "uuid-bob",
              role: "student",
              displayName: "Bob Dev",
              stats: { postsCount: 1, responsesCount: 0 },
            },
            tab: "posts",
            items: [],
            pagination: { page: 1, limit: 10, total: 0 },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const req = new Request(
        "http://localhost/api/users/uuid-bob?tab=posts&page=2&limit=10",
      );
      const res = await userByIdGet(req, {
        params: Promise.resolve({ id: "uuid-bob" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/users/uuid-bob?tab=posts&page=2&limit=10",
        expect.objectContaining({ cache: "no-store" }),
      );
    });

    it("relays upstream 404", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "user_not_found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/users/missing-id");
      const res = await userByIdGet(req, {
        params: Promise.resolve({ id: "missing-id" }),
      });
      expect(res.status).toBe(404);
    });
  });
});
