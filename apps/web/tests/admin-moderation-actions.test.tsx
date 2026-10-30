import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminModerationActions } from "@/components/features/admin-moderation-actions";
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

function renderActions(
  props: { kind: "help-request" | "response"; itemId: string },
  locale: "fr" | "en" = "en",
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <AdminModerationActions {...props} />
    </QueryClientProvider>,
    { locale },
  );
}

describe("AdminModerationActions", () => {
  it("renders approve and reject buttons for help requests", () => {
    renderActions({ kind: "help-request", itemId: "hr-1" });
    expect(screen.getByTestId("admin-moderation-approve-hr-1")).toBeTruthy();
    expect(screen.getByTestId("admin-moderation-reject-hr-1")).toBeTruthy();
  });

  it("refreshes after approving a help request", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const user = userEvent.setup();
    renderActions({ kind: "help-request", itemId: "hr-1" });
    await user.click(screen.getByTestId("admin-moderation-approve-hr-1"));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/moderation/help-requests/hr-1/approve",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("calls reject endpoint after confirm for responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

    const user = userEvent.setup();
    renderActions({ kind: "response", itemId: "resp-1" });
    await user.click(screen.getByTestId("admin-moderation-reject-resp-1"));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/moderation/responses/resp-1/reject",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
