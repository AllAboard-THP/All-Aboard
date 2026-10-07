export const ADMIN_SUB_NAV = [
  { href: "/admin", navKey: "dashboard" as const, exact: true },
  { href: "/admin/moderation", navKey: "moderation" as const, exact: false },
  { href: "/admin/denylist-patterns", navKey: "denylist" as const, exact: false },
  { href: "/admin/users", navKey: "users" as const, exact: false },
  { href: "/admin/subject-requests", navKey: "subjectRequests" as const, exact: false },
] as const;

export type AdminSubNavKey = (typeof ADMIN_SUB_NAV)[number]["navKey"];

export function isAdminSubNavActive(
  pathname: string | null,
  href: string,
  exact = false,
): boolean {
  if (!pathname) {
    return false;
  }

  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
