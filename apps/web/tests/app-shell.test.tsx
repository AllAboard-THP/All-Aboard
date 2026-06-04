import type React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";

import { AppShell } from "@/components/features/app-shell";
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

vi.mock("@/components/features/app-shell-nav", () => ({
  AppShellNav: () => <nav aria-label="Navigation principale">Nav</nav>,
}));

vi.mock("@/components/features/locale-switcher", () => ({
  LocaleSwitcher: () => <div data-testid="locale-switcher">Locale</div>,
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
  it("exposes header, main landmark, navigation and locale switcher", async () => {
    const ui = await AppShell({ children: <p>Contenu page</p> });
    renderWithI18n(ui);

    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByText("Entraide étudiante en temps réel")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Navigation principale" })).toBeTruthy();
    expect(screen.getByRole("main").getAttribute("id")).toBe("main-content");
    expect(screen.getByTestId("locale-switcher")).toBeTruthy();
    expect(screen.getByText("Contenu page")).toBeTruthy();
  });
});
