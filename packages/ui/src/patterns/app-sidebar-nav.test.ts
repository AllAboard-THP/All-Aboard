import { describe, it, expect } from "vitest";

import {
  buildAppSidebarSections,
  buildSidebarContextPanelLabels,
  isAppSidebarItemActive,
  normalizeAppSidebarPathname,
  resolveAppSidebarActiveId,
  resolveAppSidebarContext,
  resolveAppSidebarContextPanel,
  resolveAppSidebarRoleFlags,
} from "@allaboard/ui/patterns/app-sidebar-nav";

describe("app-sidebar-nav", () => {
  it("normalizes locale prefixes", () => {
    expect(normalizeAppSidebarPathname("/en/feed")).toBe("/feed");
    expect(normalizeAppSidebarPathname("/fr")).toBe("/");
  });

  it("marks feed and request routes active under feed", () => {
    expect(isAppSidebarItemActive("/feed", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/requests/abc", "/feed")).toBe(true);
    expect(isAppSidebarItemActive("/help/new", "/feed")).toBe(false);
    expect(isAppSidebarItemActive("/profile", "/feed")).toBe(false);
  });

  it("marks help/new active under newRequest", () => {
    expect(isAppSidebarItemActive("/help/new", "/help/new")).toBe(true);
    expect(resolveAppSidebarActiveId("/help/new")).toBe("newRequest");
  });

  it("marks admin sub-routes with specific nav ids", () => {
    expect(isAppSidebarItemActive("/admin", "/admin")).toBe(true);
    expect(isAppSidebarItemActive("/admin/users", "/admin")).toBe(false);
    expect(isAppSidebarItemActive("/admin/users", "/admin/users")).toBe(true);
    expect(isAppSidebarItemActive("/admin/moderation", "/admin/moderation")).toBe(true);
    expect(resolveAppSidebarActiveId("/admin/users")).toBe("adminUsers");
    expect(resolveAppSidebarActiveId("/admin/moderation")).toBe("adminModeration");
  });

  it("resolves student sidebar without mentor or admin sections", () => {
    const student = resolveAppSidebarContext("/feed", { isMentor: false, isAdmin: false });
    expect(student.showMentorSection).toBe(false);
    expect(student.showAdminSection).toBe(false);
    expect(student.openSectionIds).toEqual(["navigation", "community"]);
  });

  it("resolves mentor sidebar with mentor section only", () => {
    const mentor = resolveAppSidebarContext("/mentor", { isMentor: true, isAdmin: false });
    expect(mentor.showMentorSection).toBe(true);
    expect(mentor.showAdminSection).toBe(false);
    expect(mentor.openSectionIds).toEqual(["navigation", "community", "mentor"]);
  });

  it("marks explore routes active for subject pages", () => {
    expect(isAppSidebarItemActive("/subjects/javascript", "/explore")).toBe(true);
    expect(isAppSidebarItemActive("/feed", "/explore")).toBe(false);
  });

  it("resolves admin sidebar with mentor and admin sections", () => {
    const admin = resolveAppSidebarContext("/admin/users", { isAdmin: true });
    expect(admin.activeId).toBe("adminUsers");
    expect(admin.showMentorSection).toBe(true);
    expect(admin.showAdminSection).toBe(true);
    expect(admin.openSectionIds).toEqual(["navigation", "community", "mentor", "admin"]);
  });

  it("builds student sections with eight navigation+community items", () => {
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
      events: "Events",
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
      showMentorSection: false,
      showAdminSection: false,
    });

    expect(sections).toHaveLength(2);
    expect(sections[0]?.items).toHaveLength(4);
    expect(sections[1]?.items).toHaveLength(4);
  });

  it("grants admin role mentor section access", () => {
    expect(resolveAppSidebarRoleFlags({ isAdmin: true })).toEqual({
      showMentorSection: true,
      showAdminSection: true,
    });
  });

  it("builds dashboard context panel with quick links", () => {
    const labels = buildSidebarContextPanelLabels("dashboard", {
      dashboard: {
        title: "On this page",
        description: "Shortcuts",
        newRequest: "New request",
        browseFeed: "Browse feed",
        inbox: "Unread messages",
        myRequests: "My requests",
      },
      subjects: { title: "Subjects", explore: "Explore" },
      resources: { title: "Resources", all: "All" },
      events: { title: "Events", all: "All" },
      newRequest: {
        title: "New",
        description: "Desc",
        create: "Create",
        backToFeed: "Back",
      },
      feed: {
        title: "Feed",
        description: "Desc",
        browse: "Browse",
        newRequest: "New",
        backToFeed: "Back",
      },
      messages: { title: "Messages", inbox: "Inbox" },
      mentor: { title: "Mentor", space: "Space" },
      profile: { title: "Profile", view: "View" },
      admin: {
        title: "Admin",
        description: "Desc",
        overview: "Overview",
        users: "Users",
        moderation: "Moderation",
      },
    });

    const panel = resolveAppSidebarContextPanel("dashboard", labels);
    expect(panel?.title).toBe("On this page");
    expect(panel?.links).toHaveLength(4);
    expect(panel?.links[0]?.href).toBe("/help/new");
    expect(panel?.links[3]?.href).toBe("/me/posts");
  });
});
