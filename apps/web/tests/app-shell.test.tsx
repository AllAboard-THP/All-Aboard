import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { cookies } from "next/headers";

import { AppShell } from "@/components/features/app-shell";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/api-server", () => ({
  fetchAuthMe: vi.fn(),
}));

vi.mock("@/components/features/app-shell-nav", () => ({
  AppShellNav: () => <nav aria-label="Navigation principale">Nav</nav>,
}));

vi.mock("@/components/features/app-shell-user-menu", () => ({
  AppShellUserMenu: () => <div data-testid="app-shell-user-menu">User menu</div>,
}));

vi.mock("@/components/features/app-shell-auth-actions", () => ({
  AppShellAuthActions: () => <div data-testid="app-shell-auth-actions">Auth</div>,
}));

vi.mock("@/components/features/locale-switcher", () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher">Locale</div>,
}));

vi.mock("@/components/features/cgu-gate", () => ({
  CguGate: () => <div data-testid="cgu-gate">CGU gate</div>,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => {
    const fr = (await import("../messages/fr.json")).default as Record<
      string,
      Record<string, string>
    >;
    return (key: string) =>
      (fr.common as Record<string, string>)[key] ?? key;
  },
}));

describe("AppShell", () => {
  beforeEach(() => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as Awaited<ReturnType<typeof cookies>>);
  });

  it("exposes header, main landmark, navigation and locale switcher", async () => {
    const ui = await AppShell({ children: <p>Contenu page</p> });
    renderWithI18n(ui);

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getAllByText("All-Aboard").length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: "Navigation principale" })).toBeTruthy();
    expect(screen.getByRole("main").getAttribute("id")).toBe("main-content");
    expect(screen.getByTestId("locale-switcher")).toBeTruthy();
    expect(screen.getByTestId("app-shell-auth-actions")).toBeTruthy();
    expect(screen.getByText("Contenu page")).toBeTruthy();
  });
});
