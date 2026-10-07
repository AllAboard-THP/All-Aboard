import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MentorResourceReviewActions } from "@/components/features/mentor-resource-review-actions";
import { renderWithI18n } from "./i18n-test-utils";

const refreshMock = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

beforeEach(() => {
  refreshMock.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("confirm", vi.fn(() => true));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderActions(locale: "fr" | "en" = "en") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <MentorResourceReviewActions resourceId="res-1" />
    </QueryClientProvider>,
    { locale },
  );
}

describe("MentorResourceReviewActions", () => {
  it("renders approve and reject buttons", () => {
    renderActions();
    expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
  });

  it("refreshes after approve", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ item: { id: "res-1", status: "published" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const user = userEvent.setup();
    renderActions();
    await user.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/mentor/resources/res-1/approve",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
