import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";

import { GET as missionsGet, POST as missionsPost } from "@/app/api/missions/route";
import { DELETE as missionDelete, PATCH as missionPatch } from "@/app/api/missions/[id]/route";
import { POST as applyPost } from "@/app/api/missions/[id]/applications/route";
import { DELETE as withdrawMine } from "@/app/api/missions/[id]/applications/mine/route";
import { POST as decisionPost } from "@/app/api/missions/[id]/applications/[applicationId]/decision/route";
import { POST as validatePost } from "@/app/api/missions/[id]/applications/[applicationId]/validate/route";
import { DELETE as validationDelete } from "@/app/api/missions/[id]/applications/[applicationId]/validation/route";
import { GET as myMissionsGet } from "@/app/api/me/missions/route";
import { GET as experiencesGet } from "@/app/api/users/[id]/experiences/route";

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

const params = (p: Record<string, string>) => ({ params: Promise.resolve(p) });

describe("BFF missions (#193)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    mockToken("jwt-user");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GET /api/missions forwards the query string with the Bearer token", async () => {
    fetchMock.mockResolvedValueOnce(json({ items: [] }));
    const res = await missionsGet(new Request("http://localhost/api/missions?kind=hackathon"));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test:4000/missions?kind=hackathon",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ authorization: "Bearer jwt-user" }),
      }),
    );
  });

  it("refuses without a session", async () => {
    mockToken(undefined);
    const res = await missionsPost(
      new Request("http://localhost/api/missions", { method: "POST", body: "{}" }),
    );
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("relays upstream errors unchanged", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: "mentor_only" }, 403));
    const res = await missionsPost(
      new Request("http://localhost/api/missions", {
        method: "POST",
        body: JSON.stringify({ kind: "freelance" }),
      }),
    );
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "mentor_only" });
  });

  it("routes each mission action to its upstream path", async () => {
    const cases: [() => Promise<Response>, string, string][] = [
      [
        () =>
          missionPatch(
            new Request("http://localhost/x", { method: "PATCH", body: '{"status":"completed"}' }),
            params({ id: "m1" }),
          ),
        "PATCH",
        "/missions/m1",
      ],
      [() => missionDelete(new Request("http://localhost/x"), params({ id: "m1" })), "DELETE", "/missions/m1"],
      [
        () =>
          applyPost(
            new Request("http://localhost/x", { method: "POST", body: '{"message":"hi"}' }),
            params({ id: "m1" }),
          ),
        "POST",
        "/missions/m1/applications",
      ],
      [
        () => withdrawMine(new Request("http://localhost/x"), params({ id: "m1" })),
        "DELETE",
        "/missions/m1/applications/mine",
      ],
      [
        () =>
          decisionPost(
            new Request("http://localhost/x", { method: "POST", body: '{"decision":"accepted"}' }),
            params({ id: "m1", applicationId: "a1" }),
          ),
        "POST",
        "/missions/m1/applications/a1/decision",
      ],
      [
        () =>
          validatePost(
            new Request("http://localhost/x", { method: "POST", body: "" }),
            params({ id: "m1", applicationId: "a1" }),
          ),
        "POST",
        "/missions/m1/applications/a1/validate",
      ],
      [
        () => validationDelete(new Request("http://localhost/x"), params({ id: "m1", applicationId: "a1" })),
        "DELETE",
        "/missions/m1/applications/a1/validation",
      ],
      [() => myMissionsGet(), "GET", "/me/missions"],
    ];
    for (const [call, method, path] of cases) {
      fetchMock.mockReset();
      fetchMock.mockResolvedValueOnce(json({}));
      await call();
      expect(fetchMock).toHaveBeenCalledWith(
        `http://api.test:4000${path}`,
        expect.objectContaining({ method }),
      );
    }
  });

  it("an empty validate body becomes {}", async () => {
    fetchMock.mockResolvedValueOnce(json({ item: {} }, 201));
    await validatePost(
      new Request("http://localhost/x", { method: "POST", body: "" }),
      params({ id: "m1", applicationId: "a1" }),
    );
    expect(fetchMock.mock.calls[0]![1]).toMatchObject({ body: "{}" });
  });

  it("GET /api/users/:id/experiences is public", async () => {
    mockToken(undefined);
    fetchMock.mockResolvedValueOnce(json({ items: [] }));
    const res = await experiencesGet(
      new Request("http://localhost/api/users/u1/experiences"),
      params({ id: "u1" }),
    );
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test:4000/users/u1/experiences",
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
