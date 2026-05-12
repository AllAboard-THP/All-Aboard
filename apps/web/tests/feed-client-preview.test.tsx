import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedClientPreview } from "../components/feed-client-preview";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
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
});
