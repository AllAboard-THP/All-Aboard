import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SubjectRequestModal } from "@/components/features/subject-request-modal";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/explore",
}));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderModal(open = true) {
  const onOpenChange = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <SubjectRequestModal
        open={open}
        onOpenChange={onOpenChange}
        returnTo="/explore"
      />
    </QueryClientProvider>,
  );

  return { onOpenChange };
}

describe("SubjectRequestModal", () => {
  it("shows login prompt when unauthenticated", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("", { status: 401 }),
    );

    renderModal();

    expect(await screen.findByTestId("subject-request-login-required")).toBeTruthy();
    expect(screen.getByText("Connexion requise")).toBeTruthy();
    expect(screen.getByRole("link", { name: "la page de connexion" }).getAttribute(
      "href",
    )).toBe("/login?returnTo=%2Fexplore");
  });

  it("submits subject request and shows success state", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ userId: "u-1", role: "user" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
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

    renderModal();
    await screen.findByTestId("subject-request-name");
    fireEvent.change(screen.getByTestId("subject-request-name"), {
      target: { value: "Rust" },
    });
    fireEvent.change(screen.getByTestId("subject-request-description"), {
      target: { value: "Systems programming" },
    });
    fireEvent.click(screen.getByTestId("subject-request-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("subject-request-success-close")).toBeTruthy();
    });

    expect(screen.getByText("Demande envoyée !")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subject-requests",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name: "Rust",
          description: "Systems programming",
        }),
      }),
    );
  });

  it("does not render when closed", () => {
    renderModal(false);
    expect(screen.queryByTestId("subject-request-modal")).toBeNull();
  });
});
