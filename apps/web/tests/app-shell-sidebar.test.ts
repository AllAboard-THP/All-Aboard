import { describe, it, expect } from "vitest";

import {
  isAppSidebarItemActive,
  normalizeAppPathname,
  shouldShowAppSidebar,
} from "@/lib/app-shell-sidebar";

describe("app-shell-sidebar", () => {
  it("normalizes locale prefixes", () => {
    expect(normalizeAppPathname("/en/feed")).toBe("/feed");
    expect(normalizeAppPathname("/fr")).toBe("/");
  });

  it("hides sidebar on landing and legal routes", () => {
    expect(shouldShowAppSidebar("/")).toBe(false);
    expect(shouldShowAppSidebar("/legal/cgu")).toBe(false);
    expect(shouldShowAppSidebar("/legal/privacy")).toBe(false);
    expect(shouldShowAppSidebar("/register")).toBe(false);
    expect(shouldShowAppSidebar("/onboarding")).toBe(false);
  });

  it("shows sidebar on app routes", () => {
    expect(shouldShowAppSidebar("/feed")).toBe(true);
    expect(shouldShowAppSidebar("/dashboard/demo")).toBe(true);
    expect(shouldShowAppSidebar("/profile")).toBe(true);
  });

  it("marks feed and dashboard items active", () => {
    expect(isAppSidebarItemActive("/feed", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/requests/abc", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/help/new", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/dashboard/demo", "/dashboard/demo")).toBe(true);
    expect(isAppSidebarItemActive("/admin/users", "/admin")).toBe(true);
    expect(isAppSidebarItemActive("/profile", "/feed")).toBe(false);
  });
});
