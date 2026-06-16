import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import {
  GET as conversationsGet,
  POST as conversationsPost,
} from "@/app/api/conversations/route";
import {
  GET as messagesGet,
  POST as messagesPost,
} from "@/app/api/conversations/[id]/messages/route";
import { PATCH as readPatch } from "@/app/api/conversations/[id]/read/route";

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

const sampleMessage = {
  id: "msg-1",
  body: "Salut !",
  userId: "user-bob",
  userName: "Bob",
  createdAt: "2026-01-01T00:00:00.000Z",
  type: "message" as const,
};

const sampleInboxItem = {
  id: "conv-1",
  topic: "Aide React",
  updatedAt: "2026-01-01T00:00:00.000Z",
  otherParticipant: {
    id: "user-alice",
    displayName: "Alice",
    avatarUrl: "https://example.com/a.png",
  },
  lastMessage: sampleMessage,
  unreadCount: 2,
};

const sampleConversation = {
  id: "conv-1",
  topic: "Aide React",
  updatedAt: "2026-01-01T00:00:00.000Z",
  otherParticipant: {
    id: "user-alice",
    displayName: "Alice",
  },
};

function mockToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) =>
      name === "access_token" ? { value: "jwt-chat" } : undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

function mockNoToken() {
  vi.mocked(cookies).mockResolvedValue({
    get: () => undefined,
  } as Awaited<ReturnType<typeof cookies>>);
}

describe("BFF Phase 5 (W-P2-05)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/conversations", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await conversationsGet();
      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and validates inbox shape", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [sampleInboxItem] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await conversationsGet();
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/conversations",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-chat",
          }),
        }),
      );
      const body = (await res.json()) as { items: typeof sampleInboxItem[] };
      expect(body.items[0]?.unreadCount).toBe(2);
    });

    it("returns 502 on invalid upstream shape", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [{ id: 1 }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await conversationsGet();
      expect(res.status).toBe(502);
    });

    it("relays upstream 403", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await conversationsGet();
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/conversations", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await conversationsPost(
        new Request("http://localhost/api/conversations", {
          method: "POST",
          body: JSON.stringify({ recipientId: "user-alice" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards Bearer and relays 201", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleConversation }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await conversationsPost(
        new Request("http://localhost/api/conversations", {
          method: "POST",
          body: JSON.stringify({ recipientId: "user-alice" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/conversations",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-chat",
          }),
        }),
      );
    });

    it("relays 200 when direct thread already exists", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleConversation }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await conversationsPost(
        new Request("http://localhost/api/conversations", {
          method: "POST",
          body: JSON.stringify({ recipientId: "user-alice" }),
          headers: { "content-type": "application/json" },
        }),
      );

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/conversations/[id]/messages", () => {
    it("returns 401 missing_token when no cookie", async () => {
      mockNoToken();

      const res = await messagesGet(
        new Request("http://localhost/api/conversations/conv-1/messages"),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(401);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("forwards query string and validates messages shape", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [sampleMessage],
            pagination: { page: 1, limit: 50, total: 1 },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await messagesGet(
        new Request(
          "http://localhost/api/conversations/conv-1/messages?page=2&limit=25",
        ),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/conversations/conv-1/messages?page=2&limit=25",
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: "Bearer jwt-chat",
          }),
        }),
      );
      const body = (await res.json()) as { items: typeof sampleMessage[] };
      expect(body.items[0]?.body).toBe("Salut !");
    });

    it("relays upstream 403 for non-participant", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await messagesGet(
        new Request("http://localhost/api/conversations/conv-1/messages"),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/conversations/[id]/messages", () => {
    it("returns 401 without cookie", async () => {
      mockNoToken();

      const res = await messagesPost(
        new Request("http://localhost/api/conversations/conv-1/messages", {
          method: "POST",
          body: JSON.stringify({ body: "Hello" }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(401);
    });

    it("forwards auth and relays 201", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ item: sampleMessage }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      );

      const res = await messagesPost(
        new Request("http://localhost/api/conversations/conv-1/messages", {
          method: "POST",
          body: JSON.stringify({ body: "Salut !" }),
          headers: { "content-type": "application/json" },
        }),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(201);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/conversations/conv-1/messages",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-chat",
          }),
        }),
      );
    });
  });

  describe("PATCH /api/conversations/[id]/read", () => {
    it("returns 401 without cookie", async () => {
      mockNoToken();

      const res = await readPatch(
        new Request("http://localhost/api/conversations/conv-1/read", {
          method: "PATCH",
        }),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(401);
    });

    it("forwards auth and relays upstream", async () => {
      mockToken();
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: true,
            lastReadAt: "2026-01-01T12:00:00.000Z",
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      );

      const res = await readPatch(
        new Request("http://localhost/api/conversations/conv-1/read", {
          method: "PATCH",
        }),
        { params: Promise.resolve({ id: "conv-1" }) },
      );

      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        "http://api.test:4000/conversations/conv-1/read",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            authorization: "Bearer jwt-chat",
          }),
        }),
      );
      const body = (await res.json()) as { ok: boolean; lastReadAt: string };
      expect(body.ok).toBe(true);
    });
  });
});
