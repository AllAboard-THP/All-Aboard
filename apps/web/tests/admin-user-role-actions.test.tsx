import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUserRoleActions } from "@/components/features/admin-user-role-actions";
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
  props: { userId: string; role: "student" | "mentor" | "admin" },
  locale: "fr" | "en" = "en",
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  renderWithI18n(
    <QueryClientProvider client={queryClient}>
      <AdminUserRoleActions {...props} />
    </QueryClientProvider>,
    { locale },
  );
}

describe("AdminUserRoleActions", () => {
  it("shows promote admin and mentor actions for students", () => {
    renderActions({ userId: "user-1", role: "student" });
    expect(screen.getByTestId("admin-user-admin-toggle-user-1")).toBeTruthy();
    expect(screen.getByTestId("admin-user-mentor-toggle-user-1")).toBeTruthy();
  });

  it("promotes student to admin after confirm", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ item: { id: "user-1", role: "admin" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const user = userEvent.setup();
    renderActions({ userId: "user-1", role: "student" });
    await user.click(screen.getByTestId("admin-user-admin-toggle-user-1"));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/users/user-1/promote-admin",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ admin: true }),
      }),
    );
  });

  it("hides mentor toggle for admin accounts", () => {
    renderActions({ userId: "admin-1", role: "admin" });
    expect(screen.getByTestId("admin-user-admin-toggle-admin-1")).toBeTruthy();
    expect(screen.queryByTestId("admin-user-mentor-toggle-admin-1")).toBeNull();
  });
});
