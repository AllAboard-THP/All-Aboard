import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";

import {
  AppShellNav,
} from "@/components/features/app-shell-nav";
import { renderWithI18n } from "./i18n-test-utils";

const usePathname = vi.fn(() => "/feed");
const mockUseAuthRole = vi.fn(() => ({
  isMentor: true,
  isAdmin: false,
  role: "mentor" as const,
}));

vi.mock("@/lib/use-auth-role", () => ({
  useAuthRole: () => mockUseAuthRole(),
}));

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
    mockUseAuthRole.mockReturnValue({
      isMentor: true,
      isAdmin: false,
      role: "mentor",
    });
  });

  it("renders primary navigation links including messages", () => {
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    expect(nav.getByRole("link", { name: "Feed" })).toBeTruthy();
    expect(nav.getByRole("link", { name: "Explorer" })).toBeTruthy();
    expect(nav.getByRole("link", { name: "Ressources" })).toBeTruthy();
    expect(nav.getByRole("link", { name: "Nouvelle demande" })).toBeTruthy();
    expect(nav.getByRole("link", { name: "Messages" })).toBeTruthy();
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
    expect(nav.getByRole("link", { name: "Nouvelle demande" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(nav.getByRole("link", { name: "Feed" }).getAttribute("aria-current")).toBeNull();
  });

  it("marks Explorer as current on /explore", () => {
    usePathname.mockReturnValue("/explore");
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    expect(nav.getByRole("link", { name: "Explorer" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(nav.getByRole("link", { name: "Feed" }).getAttribute("aria-current")).toBeNull();
  });

  it("hides mentor link for students", () => {
    mockUseAuthRole.mockReturnValue({
      isMentor: false,
      isAdmin: false,
      role: "student",
    });
    renderWithI18n(<AppShellNav />);
    const nav = getPrimaryNav();
    expect(nav.queryByRole("link", { name: "Mentor" })).toBeNull();
  });
});
