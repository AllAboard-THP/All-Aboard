import { describe, it, expect } from "vitest";

import {
  buildAppSidebarSections,
  isAppSidebarItemActive,
  normalizeAppPathname,
  resolveAppSidebarContext,
  shouldShowAppSidebar,
} from "@/lib/app-shell-sidebar";

describe("app-shell-sidebar", () => {
  it("normalizes locale prefixes", () => {
    expect(normalizeAppPathname("/en/feed")).toBe("/feed");
    expect(normalizeAppPathname("/fr")).toBe("/");
  });

  it("hides sidebar on landing and legal routes", () => {
    expect(shouldShowAppSidebar("/")).toBe(false);
    expect(shouldShowAppSidebar("/login")).toBe(false);
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

  it("marks feed, new request and admin items active", () => {
    expect(isAppSidebarItemActive("/feed", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/requests/abc", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/help/new", "/feed")).toBe(false);
    expect(isAppSidebarItemActive("/help/new", "/help/new")).toBe(true);
    expect(isAppSidebarItemActive("/dashboard/demo", "/dashboard/demo")).toBe(true);
    expect(isAppSidebarItemActive("/admin/users", "/admin/users")).toBe(true);
    expect(isAppSidebarItemActive("/profile", "/feed")).toBe(false);
  });

  it("exposes role-gated sections via resolveAppSidebarContext", () => {
    const student = resolveAppSidebarContext("/feed");
    expect(student.showMentorSection).toBe(false);
    expect(student.showAdminSection).toBe(false);

    const admin = resolveAppSidebarContext("/admin", { isAdmin: true, isMentor: true });
    expect(admin.showMentorSection).toBe(true);
    expect(admin.showAdminSection).toBe(true);
  });

  it("builds admin rail with three tabs", () => {
    const labels = {
      navigationGroup: "Nav",
      communityGroup: "Comm",
      mentorGroup: "Mentor",
      adminGroup: "Admin",
      expandSidebar: "Expand",
      collapseSidebar: "Collapse",
      openMenu: "Open",
      closeMenu: "Close",
      dashboard: "Dashboard",
      subjects: "Subjects",
      resources: "Resources",
      newRequest: "New",
      feed: "Feed",
      messages: "Messages",
      profile: "Profile",
      mentor: "Mentor",
      admin: "Overview",
      adminUsers: "Users",
      adminModeration: "Moderation",
    };

    const sections = buildAppSidebarSections(labels, {
      showMentorSection: true,
      showAdminSection: true,
    });

    const adminSection = sections.find((section) => section.id === "admin");
    expect(adminSection?.items).toHaveLength(3);
  });
});
