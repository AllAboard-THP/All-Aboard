import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedClientPreview } from "../components/features/feed-client-preview";
import { renderWithIntl } from "./render-with-intl";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderWithIntl(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("FeedClientPreview", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads feed via useQuery", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: "1",
              title: "Mock",
              authorId: "a",
              createdAt: "2020-01-01T00:00:00.000Z",
            },
          ],
        }),
      }),
    );

    renderWithClient(<FeedClientPreview />);

    await waitFor(() => {
      expect(screen.getByText(/useQuery/i)).toBeTruthy();
    });
    expect(screen.getByText(/1 entr/)).toBeTruthy();
  });

  it("refetch via invalidateQueries calls fetch again", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "1",
            title: "Mock",
            authorId: "a",
            createdAt: "2020-01-01T00:00:00.000Z",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    renderWithClient(<FeedClientPreview />);

    await waitFor(() => {
      expect(screen.getByText(/useQuery/i)).toBeTruthy();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /Rafraîchir le feed/i }));

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
