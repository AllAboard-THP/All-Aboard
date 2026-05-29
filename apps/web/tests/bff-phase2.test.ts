import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { GET as authMeGet } from "@/app/api/auth/me/route";
import { POST as helpRequestsPost } from "@/app/api/help-requests/route";
import { GET as helpRequestByIdGet } from "@/app/api/help-requests/[id]/route";
import { POST as helpRequestResponsesPost } from "@/app/api/help-requests/[id]/responses/route";
import { GET as mentorFeedGet } from "@/app/api/mentor/feed/route";

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

  describe("GET /api/help-requests/[id]", () => {
    it("relays upstream 200", async () => {
      const detail = {
        item: {
          id: "id-1",
          title: "Help",
          authorId: "bob",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        responses: [],
      };
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(detail), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await helpRequestByIdGet(
        new Request("http://localhost/api/help-requests/id-1"),
        { params: Promise.resolve({ id: "id-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/id-1",
        expect.objectContaining({ cache: "no-store" }),
      );
      const body = (await res.json()) as typeof detail;
      expect(body.item.id).toBe("id-1");
    });

    it("relays upstream 404", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "not_found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await helpRequestByIdGet(
        new Request("http://localhost/api/help-requests/missing"),
        { params: Promise.resolve({ id: "missing" }) },
      );

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/help-requests/[id]/responses", () => {
    it("returns 401 missing_token when no cookie", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const req = new Request("http://localhost/api/help-requests/id-1/responses", {
        method: "POST",
        body: JSON.stringify({ body: "Answer" }),
        headers: { "content-type": "application/json" },
      });
      const res = await helpRequestResponsesPost(req, {
        params: Promise.resolve({ id: "id-1" }),
      });

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
          id: "resp-1",
          helpRequestId: "id-1",
          body: "Answer",
          authorId: "alice@dev.local",
        },
      };
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(created), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/help-requests/id-1/responses", {
        method: "POST",
        body: JSON.stringify({ body: "Answer" }),
        headers: { "content-type": "application/json" },
      });
      const res = await helpRequestResponsesPost(req, {
        params: Promise.resolve({ id: "id-1" }),
      });

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/id-1/responses",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-token-xyz",
          }),
        }),
      );
      const body = (await res.json()) as typeof created;
      expect(body.item.id).toBe("resp-1");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 401 missing_token when no cookie", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const res = await authMeGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays 200", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: (name: string) =>
          name === "access_token" ? { value: "jwt-mentor" } : undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ userId: "alice", role: "mentor" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await authMeGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/me",
        expect.objectContaining({
          headers: { authorization: "Bearer jwt-mentor" },
        }),
      );
    });
  });

  describe("GET /api/mentor/feed", () => {
    it("returns 401 missing_token when no cookie", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: () => undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      const res = await mentorFeedGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays enriched feed", async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: (name: string) =>
          name === "access_token" ? { value: "jwt-mentor" } : undefined,
      } as Awaited<ReturnType<typeof cookies>>);

      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: "hr-1",
                title: "Tagged",
                authorId: "bob@dev.local",
                createdAt: "2020-01-01T00:00:00.000Z",
                tags: ["mentor"],
                responseCount: 1,
                lastResponseAt: "2020-01-02T00:00:00.000Z",
                hasUnreadForMentor: true,
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await mentorFeedGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/mentor/feed",
        expect.objectContaining({
          headers: { authorization: "Bearer jwt-mentor" },
        }),
      );
      const body = (await res.json()) as {
        items: Array<{ hasUnreadForMentor: boolean }>;
      };
      expect(body.items[0]?.hasUnreadForMentor).toBe(true);
    });
  });
});
