import { describe, it, expect } from "vitest";

import {
  isAppSidebarItemActive,
  normalizeAppSidebarPathname,
  resolveAppSidebarActiveId,
  resolveAppSidebarContext,
} from "@allaboard/ui/patterns/app-sidebar-nav";

describe("app-sidebar-nav", () => {
  it("normalizes locale prefixes", () => {
    expect(normalizeAppSidebarPathname("/en/feed")).toBe("/feed");
    expect(normalizeAppSidebarPathname("/fr")).toBe("/");
  });

  it("marks feed, help and request routes active under feed", () => {
    expect(isAppSidebarItemActive("/feed", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/requests/abc", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/help/new", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/profile", "/feed")).toBe(false);
  });

  it("marks admin routes active under admin", () => {
    expect(isAppSidebarItemActive("/admin", "/admin")).toBe(true);
    expect(isAppSidebarItemActive("/admin/users", "/admin")).toBe(true);
    expect(isAppSidebarItemActive("/admin/moderation", "/admin")).toBe(true);
  });

  it("resolves active id and admin section from pathname", () => {
    expect(resolveAppSidebarActiveId("/help/new")).toBe("feed");
    expect(resolveAppSidebarActiveId("/admin/users")).toBe("admin");

    const adminContext = resolveAppSidebarContext("/admin/users", { isAdmin: true });
    expect(adminContext.activeId).toBe("admin");
    expect(adminContext.showAdminSection).toBe(true);
    expect(adminContext.openSectionIds).toContain("admin");
  });
});
