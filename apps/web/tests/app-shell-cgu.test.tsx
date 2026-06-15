import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import { cookies } from "next/headers";

import { AppShell } from "@/components/features/app-shell";
import { fetchAuthMe } from "@/lib/api-server";
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
    return (key: string) => fr.common[key] ?? key;
  },
}));

describe("AppShell CGU gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "access_token" ? { value: "jwt-test" } : undefined,
    } as Awaited<ReturnType<typeof cookies>>);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders CguGate when authenticated user has not accepted CGU", async () => {
    vi.mocked(fetchAuthMe).mockResolvedValue({
      ok: true,
      data: {
        userId: "user-1",
        role: "student",
      },
    });

    const ui = await AppShell({ children: <p>Contenu page</p> });
    renderWithI18n(ui);

    expect(screen.getByTestId("cgu-gate")).toBeTruthy();
  });

  it("does not render CguGate when cguAcceptedAt is set", async () => {
    vi.mocked(fetchAuthMe).mockResolvedValue({
      ok: true,
      data: {
        userId: "user-1",
        role: "student",
        cguAcceptedAt: "2026-06-15T12:00:00.000Z",
      },
    });

    const ui = await AppShell({ children: <p>Contenu page</p> });
    renderWithI18n(ui);

    expect(screen.queryByTestId("cgu-gate")).toBeNull();
  });

  it("does not render CguGate when user is not authenticated", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as Awaited<ReturnType<typeof cookies>>);

    const ui = await AppShell({ children: <p>Contenu page</p> });
    renderWithI18n(ui);

    expect(screen.queryByTestId("cgu-gate")).toBeNull();
    expect(fetchAuthMe).not.toHaveBeenCalled();
  });
});
