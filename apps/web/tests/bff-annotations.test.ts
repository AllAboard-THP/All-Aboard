import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";

import {
  GET as annotationsGet,
  POST as annotationsPost,
} from "@/app/api/conversations/[id]/messages/[messageId]/annotations/route";
import { PATCH as annotationsRead } from "@/app/api/conversations/[id]/messages/[messageId]/annotations/read/route";
import {
  DELETE as annotationDelete,
  PATCH as annotationPatch,
} from "@/app/api/annotations/[annotationId]/route";
import { POST as replyPost } from "@/app/api/annotations/[annotationId]/replies/route";
import {
  DELETE as replyDelete,
  PATCH as replyPatch,
} from "@/app/api/annotation-replies/[replyId]/route";

vi.mock("@/lib/api-server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-server")>();
  return { ...actual, getApiBaseUrl: () => "http://api.test:4000" };
});

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

function mockToken(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === "access_token" && token ? { value: token } : undefined),
  } as Awaited<ReturnType<typeof cookies>>);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const params = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) });

describe("BFF video annotations (#197)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    mockToken("jwt-user");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function lastCall() {
    const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
    return { url, init };
  }

  it("relays list, create and read on a message's annotations", async () => {
    const message = params({ id: "conv-1", messageId: "msg-1" });

    fetchMock.mockResolvedValueOnce(json({ items: [], unreadCount: 0 }));
    const listed = await annotationsGet(new Request("http://localhost/x"), message);
    expect(listed.status).toBe(200);
    expect(lastCall().url).toBe(
      "http://api.test:4000/conversations/conv-1/messages/msg-1/annotations",
    );
    expect(lastCall().init.headers).toMatchObject({ authorization: "Bearer jwt-user" });

    fetchMock.mockResolvedValueOnce(json({ error: "invalid_rect" }, 400));
    const created = await annotationsPost(
      new Request("http://localhost/x", {
        method: "POST",
        body: JSON.stringify({ atMs: 10, body: "Q", rect: { x: 0.9, y: 0, w: 0.5, h: 0.1 } }),
      }),
      message,
    );
    expect(created.status).toBe(400);
    expect(await created.json()).toEqual({ error: "invalid_rect" });
    expect(lastCall().init).toMatchObject({ method: "POST" });
    expect(JSON.parse(lastCall().init.body as string)).toMatchObject({ atMs: 10 });

    fetchMock.mockResolvedValueOnce(json({ ok: true, lastReadAt: "2026-11-24T10:00:00.000Z" }));
    await annotationsRead(new Request("http://localhost/x", { method: "PATCH" }), message);
    expect(lastCall().url).toBe(
      "http://api.test:4000/conversations/conv-1/messages/msg-1/annotations/read",
    );
    expect(lastCall().init.method).toBe("PATCH");
  });

  it("relays annotation and reply edits and deletes", async () => {
    fetchMock.mockResolvedValue(json({ item: {} }));

    await annotationPatch(
      new Request("http://localhost/x", { method: "PATCH", body: JSON.stringify({ resolved: true }) }),
      params({ annotationId: "ann-1" }),
    );
    expect(lastCall().url).toBe("http://api.test:4000/annotations/ann-1");
    expect(lastCall().init.method).toBe("PATCH");

    await annotationDelete(new Request("http://localhost/x"), params({ annotationId: "ann-1" }));
    expect(lastCall().init.method).toBe("DELETE");

    await replyPost(
      new Request("http://localhost/x", { method: "POST", body: JSON.stringify({ body: "A" }) }),
      params({ annotationId: "ann-1" }),
    );
    expect(lastCall().url).toBe("http://api.test:4000/annotations/ann-1/replies");

    await replyPatch(
      new Request("http://localhost/x", { method: "PATCH", body: JSON.stringify({ body: "B" }) }),
      params({ replyId: "rep-1" }),
    );
    expect(lastCall().url).toBe("http://api.test:4000/annotation-replies/rep-1");

    await replyDelete(new Request("http://localhost/x"), params({ replyId: "rep-1" }));
    expect(lastCall().init.method).toBe("DELETE");
  });

  it("answers 401 without a session cookie", async () => {
    mockToken(undefined);
    const res = await annotationsGet(
      new Request("http://localhost/x"),
      params({ id: "conv-1", messageId: "msg-1" }),
    );
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
