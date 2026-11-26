import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { GET as resourcesGet, POST as resourcesPost } from "@/app/api/resources/route";
import {
  DELETE as resourceDelete,
  GET as resourceByIdGet,
  PATCH as resourcePatch,
} from "@/app/api/resources/[id]/route";
import { POST as subjectRequestsPost } from "@/app/api/subject-requests/route";
import { GET as mentorDashboardGet } from "@/app/api/mentor/dashboard/route";
import { POST as mentorApprovePost } from "@/app/api/mentor/resources/[id]/approve/route";
import { POST as mentorRejectPost } from "@/app/api/mentor/resources/[id]/reject/route";

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

const sampleResource = {
  id: "res-1",
  title: "Guide React",
  body: "Contenu",
  authorId: "bob@dev.local",
  status: "published" as const,
  subjectId: "sub-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const sampleDashboard = {
  stats: {
    myResourcesCount: 1,
    pendingResourcesCount: 2,
    helpMentorQueueCount: 3,
  },
  myResources: [sampleResource],
  pendingResources: [{ ...sampleResource, id: "res-2", status: "pending" as const }],
  helpMentorQueue: [
    {
      id: "hr-1",
      title: "Help",
      authorId: "alice@dev.local",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

function mockToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === "access_token" ? { value: "jwt-mentor" } : undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

function mockNoToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: () => undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

describe("BFF Phase 4 (W-P2-01)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/resources", () => {
    it("forwards query string and validates list shape", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [sampleResource],
            pagination: { page: 1, limit: 12, total: 1 },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await resourcesGet(
        new Request("http://localhost/api/resources?q=react&page=1"),
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/resources?q=react&page=1",
        expect.objectContaining({ cache: "no-store" }),
      );
      const body = (await res.json()) as { items: typeof sampleResource[] };
      expect(body.items[0]?.id).toBe("res-1");
    });

    it("returns 502 on invalid upstream shape", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ id: 1 }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await resourcesGet(new Request("http://localhost/api/resources"));
      expect(res.status).toBe(502);
    });
  });

  describe("POST /api/resources", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await resourcesPost(
        new Request("http://localhost/api/resources", {
          method: "POST",
          body: JSON.stringify({ title: "New", body: "Body", subjectId: "sub-1" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer token and relays 201", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleResource }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await resourcesPost(
        new Request("http://localhost/api/resources", {
          method: "POST",
          body: JSON.stringify({ title: "New", body: "Body", subjectId: "sub-1" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/resources",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
    });
  });

  describe("GET /api/resources/[id]", () => {
    it("relays without auth for public resource", async () => {
      mockNoToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleResource }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await resourceByIdGet(
        new Request("http://localhost/api/resources/res-1"),
        { params: Promise.resolve({ id: "res-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/resources/res-1",
        expect.objectContaining({
          headers: expect.not.objectContaining({
            authorization: expect.anything(),
          }),
        }),
      );
    });

    it("forwards Bearer when cookie present", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: { ...sampleResource, status: "pending" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await resourceByIdGet(
        new Request("http://localhost/api/resources/res-2"),
        { params: Promise.resolve({ id: "res-2" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/resources/res-2",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
    });

    it("returns 404 for missing resource", async () => {
      mockNoToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "not_found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await resourceByIdGet(
        new Request("http://localhost/api/resources/missing"),
        { params: Promise.resolve({ id: "missing" }) },
      );

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/resources/[id]", () => {
    it("returns 401 without cookie", async () => {
      mockNoToken();

      const res = await resourcePatch(
        new Request("http://localhost/api/resources/res-1", {
          method: "PATCH",
          body: JSON.stringify({ title: "Updated" }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "res-1" }) },
      );

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/resources/[id]", () => {
    it("forwards auth and relays 204", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const res = await resourceDelete(
        new Request("http://localhost/api/resources/res-1", { method: "DELETE" }),
        { params: Promise.resolve({ id: "res-1" }) },
      );

      expect(res.status).toBe(204);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/resources/res-1",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
    });
  });

  describe("POST /api/subject-requests", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await subjectRequestsPost(
        new Request("http://localhost/api/subject-requests", {
          method: "POST",
          body: JSON.stringify({ name: "Rust" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays 201", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            item: {
              id: "sr-1",
              name: "Rust",
              status: "pending",
              createdAt: "2026-01-01T00:00:00.000Z",
              updatedAt: "2026-01-01T00:00:00.000Z",
            },
          }),
          { status: 201, headers: { "content-type": "application/json" } },
        ),
      );

      const res = await subjectRequestsPost(
        new Request("http://localhost/api/subject-requests", {
          method: "POST",
          body: JSON.stringify({ name: "Rust" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/subject-requests",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
    });
  });

  describe("GET /api/mentor/dashboard", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await mentorDashboardGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and validates dashboard shape", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleDashboard), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await mentorDashboardGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/mentor/dashboard",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
      const body = (await res.json()) as typeof sampleDashboard;
      expect(body.stats.pendingResourcesCount).toBe(2);
      expect(body.helpMentorQueue).toHaveLength(1);
    });

    it("relays upstream 403", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await mentorDashboardGet();
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/mentor/resources/[id]/approve", () => {
    it("forwards auth and relays upstream", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleResource }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await mentorApprovePost(
        new Request("http://localhost/api/mentor/resources/res-2/approve", {
          method: "POST",
        }),
        { params: Promise.resolve({ id: "res-2" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/mentor/resources/res-2/approve",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-mentor",
          }),
        }),
      );
    });
  });

  describe("POST /api/mentor/resources/[id]/reject", () => {
    it("forwards auth and relays upstream", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ item: { ...sampleResource, status: "rejected" } }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await mentorRejectPost(
        new Request("http://localhost/api/mentor/resources/res-2/reject", {
          method: "POST",
        }),
        { params: Promise.resolve({ id: "res-2" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/mentor/resources/res-2/reject",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
