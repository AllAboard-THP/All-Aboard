import { describe, it, expect } from "vitest";

import {
  ADMIN_SUB_NAV,
  isAdminSubNavActive,
} from "@/lib/admin-sub-nav";

describe("admin-sub-nav", () => {
  it("marks dashboard active only on exact /admin path", () => {
    expect(isAdminSubNavActive("/admin", "/admin", true)).toBe(true);
    expect(isAdminSubNavActive("/admin/users", "/admin", true)).toBe(false);
    expect(isAdminSubNavActive("/admin/moderation", "/admin", true)).toBe(false);
  });

  it("marks nested admin routes active with prefix match", () => {
    expect(isAdminSubNavActive("/admin/users", "/admin/users")).toBe(true);
    expect(isAdminSubNavActive("/admin/denylist-patterns", "/admin/denylist-patterns")).toBe(
      true,
    );
    expect(isAdminSubNavActive("/admin/subject-requests", "/admin/subject-requests")).toBe(
      true,
    );
  });

  it("lists five admin sections in plan order", () => {
    expect(ADMIN_SUB_NAV.map((item) => item.navKey)).toEqual([
      "dashboard",
      "moderation",
      "denylist",
      "users",
      "subjectRequests",
    ]);
  });
});
