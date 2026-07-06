import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";

import { AppShellUserMenu } from "@/components/features/app-shell-user-menu";
import { renderWithI18n } from "./i18n-test-utils";

const push = vi.fn();
const refresh = vi.fn();

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
  useRouter: () => ({ push, refresh }),
}));

describe("AppShellUserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/api/mentor/feed")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{ hasUnreadForMentor: true }, { hasUnreadForMentor: false }],
            }),
          });
        }
        if (url.includes("/api/admin/dashboard")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              stats: {
                totalUsers: 10,
                totalHelpRequests: 5,
                flaggedCount: 2,
                pendingSubjectRequests: 1,
                pendingResources: 0,
              },
            }),
          });
        }
        if (url.includes("/api/auth/logout")) {
          return Promise.resolve({ ok: true, json: async () => ({ ok: true }) });
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      }),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("renders an accessible trigger with user initials", () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="user-1"
        displayName="Alice Martin"
        role="student"
      />,
    );

    expect(screen.getByTestId("app-shell-user-menu-trigger").getAttribute("aria-label")).toBe(
      "Menu utilisateur — Alice Martin",
    );
    expect(screen.getByText("AM")).toBeTruthy();
  });

  it("lists profile and personal pages in the menu", () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="user-1"
        displayName="Alice Martin"
        role="student"
        defaultOpen
      />,
    );

    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Mon profil" }).getAttribute("href")).toBe(
      "/profile",
    );
    expect(within(menu).getByRole("menuitem", { name: "Mes demandes" }).getAttribute("href")).toBe(
      "/me/posts",
    );
    expect(
      within(menu).getByRole("menuitem", { name: "Mes sauvegardes" }).getAttribute("href"),
    ).toBe("/me/bookmarks");
  });

  it("shows mentor link and badge for mentors", async () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="mentor-1"
        displayName="Bob Mentor"
        role="mentor"
        defaultOpen
      />,
    );

    await screen.findByTestId("user-menu-mentor-badge");
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Espace mentor/ }).getAttribute("href")).toBe(
      "/mentor",
    );
  });

  it("shows admin link and badge for administrators", async () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="admin-1"
        displayName="Carol Admin"
        role="admin"
        defaultOpen
      />,
    );

    await screen.findByTestId("user-menu-admin-badge");
    const menu = screen.getByRole("menu");
    expect(screen.getByTestId("user-menu-admin-link").getAttribute("href")).toBe("/admin");
    expect(within(menu).getByRole("menuitem", { name: /Administration/ })).toBeTruthy();
    expect(within(menu).getByText("3")).toBeTruthy();
  });

  it("does not show admin link for students", () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="user-1"
        displayName="Alice Martin"
        role="student"
        defaultOpen
      />,
    );

    expect(screen.queryByTestId("user-menu-admin-link")).toBeNull();
    expect(screen.queryByTestId("user-menu-admin-badge")).toBeNull();
  });

  it("does not show admin link for mentors", () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="mentor-1"
        displayName="Bob Mentor"
        role="mentor"
        defaultOpen
      />,
    );

    expect(screen.queryByTestId("user-menu-admin-link")).toBeNull();
    expect(screen.queryByTestId("user-menu-admin-badge")).toBeNull();
  });

  it("logs out via BFF and refreshes the app shell", async () => {
    renderWithI18n(
      <AppShellUserMenu
        userId="user-1"
        displayName="Alice Martin"
        role="student"
        defaultOpen
      />,
    );

    fireEvent.click(screen.getByTestId("app-shell-logout"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      expect(push).toHaveBeenCalledWith("/");
      expect(refresh).toHaveBeenCalled();
    });
  });
});
