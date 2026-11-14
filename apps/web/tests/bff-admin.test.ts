import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { GET as dashboardGet } from "@/app/api/admin/dashboard/route";
import { GET as moderationGet } from "@/app/api/admin/moderation/route";
import { POST as helpRequestApprovePost } from "@/app/api/admin/moderation/help-requests/[id]/approve/route";
import { POST as helpRequestRejectPost } from "@/app/api/admin/moderation/help-requests/[id]/reject/route";
import { POST as responseApprovePost } from "@/app/api/admin/moderation/responses/[id]/approve/route";
import { POST as responseRejectPost } from "@/app/api/admin/moderation/responses/[id]/reject/route";
import {
  GET as denylistGet,
  POST as denylistPost,
} from "@/app/api/admin/denylist-patterns/route";
import {
  DELETE as denylistDelete,
  PATCH as denylistPatch,
} from "@/app/api/admin/denylist-patterns/[id]/route";
import { GET as usersGet } from "@/app/api/admin/users/route";
import { POST as promoteAdminPost } from "@/app/api/admin/users/[id]/promote-admin/route";
import { POST as promoteMentorPost } from "@/app/api/admin/users/[id]/promote-mentor/route";
import { GET as subjectRequestsGet } from "@/app/api/admin/subject-requests/route";
import { PATCH as subjectRequestPatch } from "@/app/api/admin/subject-requests/[id]/route";

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
      name === "access_token" ? { value: "jwt-admin" } : undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

function mockNoToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: () => undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

describe("BFF W-P3-05 admin relays", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/admin/dashboard", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();
      const res = await dashboardGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays upstream", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            stats: {
              totalUsers: 10,
              totalHelpRequests: 5,
              flaggedCount: 2,
              pendingSubjectRequests: 1,
              pendingResources: 0,
            },
            recentHelpRequests: [],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await dashboardGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/dashboard",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("relays upstream 403 for non-admin", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await dashboardGet();
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/admin/moderation", () => {
    it("returns 401 without cookie", async () => {
      mockNoToken();
      const res = await moderationGet();
      expect(res.status).toBe(401);
    });

    it("forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ flaggedHelpRequests: [], flaggedResponses: [] }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await moderationGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/moderation",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });
  });

  describe("moderation actions", () => {
    it("POST help-requests/[id]/approve forwards auth", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "hr-1",
              title: "Help",
              authorId: "user-1",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await helpRequestApprovePost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/moderation/help-requests/hr-1/approve",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("POST help-requests/[id]/reject relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await helpRequestRejectPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "hr-1" }),
      });

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/moderation/help-requests/hr-1/reject",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("POST responses/[id]/approve forwards auth", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "resp-1",
              helpRequestId: "hr-1",
              body: "Reply",
              authorId: "user-1",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await responseApprovePost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "resp-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/moderation/responses/resp-1/approve",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("POST responses/[id]/reject relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await responseRejectPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "resp-1" }),
      });

      expect(res.status).toBe(204);
    });
  });

  describe("denylist-patterns", () => {
    it("GET returns 401 without cookie", async () => {
      mockNoToken();
      const res = await denylistGet();
      expect(res.status).toBe(401);
    });

    it("GET forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await denylistGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/denylist-patterns",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("POST forwards body and relays 201", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "pat-1",
              label: "spam",
              pattern: "badword",
              active: true,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await denylistPost(
        new Request("http://localhost/api/admin/denylist-patterns", {
          method: "POST",
          body: JSON.stringify({ label: "spam", pattern: "badword" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/denylist-patterns",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("PATCH forwards body", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "pat-1",
              label: "spam",
              pattern: "badword",
              active: false,
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await denylistPatch(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify({ active: false }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "pat-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/denylist-patterns/pat-1",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("DELETE relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await denylistDelete(new Request("http://localhost"), {
        params: Promise.resolve({ id: "pat-1" }),
      });

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/denylist-patterns/pat-1",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("users", () => {
    it("GET returns 401 without cookie", async () => {
      mockNoToken();
      const res = await usersGet();
      expect(res.status).toBe(401);
    });

    it("GET forwards Bearer", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await usersGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/users",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("POST promote-admin forwards body", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "user-1",
              email: "bob@dev.local",
              role: "admin",
              displayName: "Bob",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await promoteAdminPost(
        new Request("http://localhost", {
          method: "POST",
          body: JSON.stringify({ admin: true }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "user-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/users/user-1/promote-admin",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("POST promote-mentor forwards auth", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "user-1",
              email: "bob@dev.local",
              role: "mentor",
              displayName: "Bob",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await promoteMentorPost(new Request("http://localhost"), {
        params: Promise.resolve({ id: "user-1" }),
      });

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/users/user-1/promote-mentor",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("subject-requests", () => {
    it("GET forwards query string", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ pending: [], approved: [], rejected: [] }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await subjectRequestsGet(
        new Request("http://localhost/api/admin/subject-requests?status=pending"),
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/subject-requests?status=pending",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });

    it("PATCH forwards body", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "sr-1",
              name: "Rust",
              status: "approved",
              authorId: "user-1",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await subjectRequestPatch(
        new Request("http://localhost", {
          method: "PATCH",
          body: JSON.stringify({ status: "approved" }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "sr-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/admin/subject-requests/sr-1",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-admin",
          }),
        }),
      );
    });
  });
});
