import { describe, it, expect, vi, beforeEach } from "vitest";

import { requireAdminSession } from "@/lib/require-admin-session";

const mockCookies = vi.fn();
const mockFetchAuthMe = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

vi.mock("@/lib/api-server", () => ({
  fetchAuthMe: (...args: unknown[]) => mockFetchAuthMe(...args),
}));

describe("requireAdminSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies when access token is missing", async () => {
    mockCookies.mockResolvedValue({
      get: () => undefined,
    });

    await expect(requireAdminSession()).resolves.toEqual({
      ok: false,
      reason: "unauthenticated",
    });
  });

  it("denies when auth/me fails", async () => {
    mockCookies.mockResolvedValue({
      get: () => ({ value: "token-1" }),
    });
    mockFetchAuthMe.mockResolvedValue({ ok: false, error: "unauthorized", status: 401 });

    await expect(requireAdminSession()).resolves.toEqual({
      ok: false,
      reason: "unauthenticated",
    });
  });

  it("forbids non-admin roles", async () => {
    mockCookies.mockResolvedValue({
      get: () => ({ value: "token-1" }),
    });
    mockFetchAuthMe.mockResolvedValue({
      ok: true,
      data: { userId: "user-1", role: "mentor", displayName: "Mentor" },
    });

    await expect(requireAdminSession()).resolves.toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("allows admin role", async () => {
    mockCookies.mockResolvedValue({
      get: () => ({ value: "token-admin" }),
    });
    mockFetchAuthMe.mockResolvedValue({
      ok: true,
      data: { userId: "admin-1", role: "admin", displayName: "Admin" },
    });

    await expect(requireAdminSession()).resolves.toEqual({
      ok: true,
      user: { userId: "admin-1", role: "admin", displayName: "Admin" },
    });
  });
});
