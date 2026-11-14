import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { POST as passkeyRegisterOptionsPost } from "@/app/api/auth/passkey/register/options/route";
import { POST as passkeyRegisterVerifyPost } from "@/app/api/auth/passkey/register/verify/route";
import { POST as passkeyLoginOptionsPost } from "@/app/api/auth/passkey/login/options/route";
import { POST as passkeyLoginVerifyPost } from "@/app/api/auth/passkey/login/verify/route";
import { GET as passkeyCredentialsGet } from "@/app/api/auth/passkey/credentials/route";
import { DELETE as passkeyCredentialDelete } from "@/app/api/auth/passkey/credentials/[id]/route";
import { GET as subjectsGet } from "@/app/api/subjects/route";
import { GET as subjectBySlugGet } from "@/app/api/subjects/[slug]/route";
import { GET as feedGet } from "@/app/api/feed/route";
import {
  DELETE as helpRequestDelete,
  PATCH as helpRequestPatch,
} from "@/app/api/help-requests/[id]/route";
import { POST as helpMentorPost } from "@/app/api/help-requests/[id]/help-mentor/route";
import { POST as suggestTagsPost } from "@/app/api/help-requests/suggest-tags/route";
import { POST as likesPost } from "@/app/api/help-requests/[id]/likes/route";
import { POST as bookmarksPost } from "@/app/api/help-requests/[id]/bookmarks/route";
import { GET as myHelpRequestsGet } from "@/app/api/me/help-requests/route";
import { GET as myBookmarksGet } from "@/app/api/me/bookmarks/route";
import {
  DELETE as responseDelete,
  PATCH as responsePatch,
} from "@/app/api/help-requests/[id]/responses/[responseId]/route";

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

function mockToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === "access_token" ? { value: "jwt-bob" } : undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

function mockNoToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: () => undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

describe("BFF W-P1-01 relays", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("passkey BFF", () => {
    it("POST /api/auth/passkey/register/options relays upstream", async () => {
      mockNoToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ options: { challenge: "abc" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request(
        "http://localhost/api/auth/passkey/register/options",
        {
          method: "POST",
          body: JSON.stringify({ fullName: "Bob", acceptCgu: true }),
          headers: { "content-type": "application/json" },
        },
      );
      const res = await passkeyRegisterOptionsPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/register/options",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("POST /api/auth/passkey/register/options forwards Bearer when signed in", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ options: { challenge: "add" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request(
        "http://localhost/api/auth/passkey/register/options",
        {
          method: "POST",
          body: "{}",
          headers: { "content-type": "application/json" },
        },
      );
      const res = await passkeyRegisterOptionsPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/register/options",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("POST /api/auth/passkey/register/verify relays Set-Cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.append(
        "set-cookie",
        "access_token=pk-jwt; Path=/; HttpOnly; SameSite=Lax",
      );
      upstreamHeaders.set("content-type", "application/json");
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, verified: true }), {
          status: 200,
          headers: upstreamHeaders,
        }),
      );

      const req = new Request(
        "http://localhost/api/auth/passkey/register/verify",
        {
          method: "POST",
          body: JSON.stringify({ id: "cred", response: {} }),
          headers: { "content-type": "application/json" },
        },
      );
      const res = await passkeyRegisterVerifyPost(req);

      expect(res.status).toBe(200);
      expect(res.headers.getSetCookie().some((c) => c.includes("access_token="))).toBe(
        true,
      );
    });

    it("POST /api/auth/passkey/login/options relays upstream", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ options: { challenge: "xyz" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/auth/passkey/login/options", {
        method: "POST",
        body: "{}",
        headers: { "content-type": "application/json" },
      });
      const res = await passkeyLoginOptionsPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/login/options",
        expect.objectContaining({ method: "POST", body: "{}" }),
      );
    });

    it("POST /api/auth/passkey/login/options normalizes empty body for Fastify", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ options: { challenge: "xyz" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const req = new Request("http://localhost/api/auth/passkey/login/options", {
        method: "POST",
      });
      const res = await passkeyLoginOptionsPost(req);

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/login/options",
        expect.objectContaining({ method: "POST", body: "{}" }),
      );
    });

    it("POST /api/auth/passkey/login/verify relays Set-Cookie", async () => {
      const upstreamHeaders = new Headers();
      upstreamHeaders.append(
        "set-cookie",
        "access_token=login-jwt; Path=/; HttpOnly",
      );
      upstreamHeaders.set("content-type", "application/json");
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: upstreamHeaders,
        }),
      );

      const req = new Request("http://localhost/api/auth/passkey/login/verify", {
        method: "POST",
        body: JSON.stringify({ id: "cred", response: {} }),
        headers: { "content-type": "application/json" },
      });
      const res = await passkeyLoginVerifyPost(req);

      expect(res.status).toBe(200);
      expect(res.headers.getSetCookie().some((c) => c.includes("access_token="))).toBe(
        true,
      );
    });

    it("GET /api/auth/passkey/credentials returns 401 without cookie", async () => {
      mockNoToken();
      const res = await passkeyCredentialsGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("GET /api/auth/passkey/credentials forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await passkeyCredentialsGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/credentials",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("DELETE /api/auth/passkey/credentials/[id] relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await passkeyCredentialDelete(new Request("http://localhost"), {
        params: Promise.resolve({ id: "pk-1" }),
      });

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/auth/passkey/credentials/pk-1",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });
  });

  describe("subjects BFF", () => {
    it("GET /api/subjects relays catalogue", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ slug: "rails", name: "Rails" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await subjectsGet(new Request("http://localhost/api/subjects"));
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/subjects",
        expect.objectContaining({ cache: "no-store" }),
      );
    });

    it("GET /api/subjects/[slug] relays detail", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ item: { slug: "rails", name: "Rails", postsCount: 3 } }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await subjectBySlugGet(
        new Request("http://localhost/api/subjects/rails"),
        { params: Promise.resolve({ slug: "rails" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/subjects/rails",
        expect.objectContaining({ cache: "no-store" }),
      );
    });
  });

  describe("GET /api/feed query forwarding", () => {
    it("forwards subject, page, and include query params", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [],
            pagination: { page: 2, limit: 10, total: 0 },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await feedGet(
        new Request(
          "http://localhost/api/feed?subject=rails&page=2&limit=10&include=widgets",
        ),
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/feed?subject=rails&page=2&limit=10&include=widgets",
        expect.objectContaining({ cache: "no-store" }),
      );
    });
  });

  describe("help-request mutations", () => {
    it("PATCH /api/help-requests/[id] forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "hr-1",
              title: "Updated",
              authorId: "bob",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const req = new Request("http://localhost/api/help-requests/hr-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
        headers: { "content-type": "application/json" },
      });
      const res = await helpRequestPatch(req, {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("DELETE /api/help-requests/[id] relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await helpRequestDelete(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(204);
    });

    it("POST /api/help-requests/[id]/help-mentor forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "hr-1",
              title: "Help",
              authorId: "bob",
              createdAt: "2026-01-01T00:00:00.000Z",
              mentorHelpRequested: true,
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await helpMentorPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1/help-mentor",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("POST /api/help-requests/suggest-tags forwards Bearer and body", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ tags: ["rails", "mentor"] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await suggestTagsPost(
        new Request("http://localhost", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title: "Need help with Rails" }),
        }),
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/suggest-tags",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("POST /api/help-requests/[id]/likes toggles like", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ liked: true, likesCount: 1 }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await likesPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1/likes",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("POST /api/help-requests/[id]/bookmarks toggles bookmark", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ bookmarked: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await bookmarksPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1/bookmarks",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("me lists", () => {
    it("GET /api/me/help-requests returns 401 without cookie", async () => {
      mockNoToken();
      const res = await myHelpRequestsGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("GET /api/me/help-requests relays author posts", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ id: "hr-1", title: "Mine" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await myHelpRequestsGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/me/help-requests",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("GET /api/me/bookmarks relays bookmarked posts", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await myBookmarksGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/me/bookmarks",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });
  });

  describe("response mutations", () => {
    it("PATCH /api/help-requests/[id]/responses/[responseId] forwards body", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "resp-1",
              helpRequestId: "hr-1",
              body: "Edited",
              authorId: "bob",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const req = new Request(
        "http://localhost/api/help-requests/hr-1/responses/resp-1",
        {
          method: "PATCH",
          body: JSON.stringify({ body: "Edited" }),
          headers: { "content-type": "application/json" },
        },
      );
      const res = await responsePatch(req, {
        params: Promise.resolve({ id: "hr-1", responseId: "resp-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1/responses/resp-1",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-bob",
          }),
        }),
      );
    });

    it("DELETE /api/help-requests/[id]/responses/[responseId] relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await responseDelete(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1", responseId: "resp-1" }),
      });

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/help-requests/hr-1/responses/resp-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });
});
