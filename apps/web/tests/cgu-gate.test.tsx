import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

import { CguGate } from "@/components/features/cgu-gate";
import { renderWithI18n } from "./i18n-test-utils";

const refreshMock = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
  useRouter: () => ({ refresh: refreshMock, push: vi.fn() }),
}));

function renderCguGate() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <CguGate />
    </QueryClientProvider>,
  );
}

describe("CguGate", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    refreshMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps submit disabled until checkbox is checked", () => {
    renderCguGate();

    expect(screen.getByTestId("cgu-gate-submit")).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByTestId("cgu-gate-checkbox"));
    expect(screen.getByTestId("cgu-gate-submit")).toHaveProperty("disabled", false);
  });

  it("posts to /api/legal/accept and refreshes on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          cguAcceptedAt: "2026-06-15T12:00:00.000Z",
        }),
        { status: 200 },
      ),
    );

    renderCguGate();
    fireEvent.click(screen.getByTestId("cgu-gate-checkbox"));
    fireEvent.click(screen.getByTestId("cgu-gate-submit"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/legal/accept", {
        method: "POST",
        credentials: "include",
      });
    });
    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("shows translated error when accept fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "missing_token" }), { status: 401 }),
    );

    renderCguGate();
    fireEvent.click(screen.getByTestId("cgu-gate-checkbox"));
    fireEvent.click(screen.getByTestId("cgu-gate-submit"));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toBe(
        "Session expirée. Reconnectez-vous.",
      );
    });
  });
});
