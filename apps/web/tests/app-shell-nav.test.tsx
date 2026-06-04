import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";

import {
  APP_SHELL_NAV,
  AppShellNav,
} from "@/components/features/app-shell-nav";
import { renderWithI18n } from "./i18n-test-utils";

const usePathname = vi.fn(() => "/feed");

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
  usePathname: () => usePathname(),
}));

function getPrimaryNav() {
  const navs = screen.getAllByRole("navigation", {
    name: "Navigation principale",
  });
  return within(navs[navs.length - 1]!);
}

describe("AppShellNav", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/feed");
  });

  it("renders three navigation links", () => {
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    for (const { navKey } of APP_SHELL_NAV) {
      const label = navKey === "feed" ? "Feed" : "Nouvelle demande";
      expect(nav.getByRole("link", { name: label })).toBeTruthy();
    }
    expect(nav.getByRole("link", { name: "Mentor" })).toBeTruthy();
  });

  it("marks Feed as current page on /feed", () => {
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    const home = nav.getByRole("link", { name: "Feed" });
    expect(home.getAttribute("href")).toBe("/feed");
    expect(home.getAttribute("aria-current")).toBe("page");
    expect(nav.getByRole("link", { name: "Nouvelle demande" }).getAttribute("aria-current")).toBeNull();
  });

  it("marks Nouvelle demande as current on /help/new", () => {
    usePathname.mockReturnValue("/help/new");
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    expect(nav.getByRole("link", { name: "Nouvelle demande" }).getAttribute("aria-current")).toBe("page");
    expect(nav.getByRole("link", { name: "Feed" }).getAttribute("aria-current")).toBeNull();
  });
});
