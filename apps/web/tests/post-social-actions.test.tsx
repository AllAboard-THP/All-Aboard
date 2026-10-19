import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";

import { PostSocialActions } from "@/components/features/post-social-actions";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/social-client", () => ({
  fetchMyBookmarks: vi.fn().mockResolvedValue({ items: [] }),
  toggleLike: vi.fn(),
  toggleBookmark: vi.fn(),
}));

function renderActions(
  props: Partial<React.ComponentProps<typeof PostSocialActions>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <PostSocialActions
        helpRequestId="req-1"
        initialLikesCount={2}
        loginReturnPath="/requests/req-1"
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("PostSocialActions", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows login hint when signed out", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    );

    renderActions();

    await waitFor(() => {
      expect(screen.getByTestId("post-social-login-hint")).toBeTruthy();
    });
    expect(screen.getByRole("link").getAttribute("href")).toContain("/login");
  });

  it("renders like and bookmark controls when authenticated", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ userId: "bob", role: "student" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    renderActions({ defaultBookmarked: true });

    await waitFor(() => {
      expect(screen.getByTestId("post-like-button")).toBeTruthy();
      expect(screen.getByTestId("post-bookmark-button")).toBeTruthy();
    });

    expect(screen.getByTestId("post-like-button").textContent).toContain("2");
    expect(screen.getByTestId("post-bookmark-button").textContent).toBe(
      "Sauvegardé",
    );
  });
});
