import { routing } from "@/i18n/routing";

export {
  APP_SIDEBAR_NAV,
  buildAppSidebarSections,
  isAppSidebarItemActive,
  normalizeAppSidebarPathname,
  resolveAppSidebarActiveId,
  resolveAppSidebarContext,
  type AppSidebarNavId,
} from "@allaboard/ui/patterns/app-sidebar-nav";

/**
 * Routes without the global app sidebar (exact match or prefix).
 * Landing, legal, and pre-auth flows stay full-width.
 */
export const APP_SIDEBAR_EXCLUDED_PREFIXES = [
  "/legal",
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
] as const;

export function normalizeAppPathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return "/";
    }
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

export function shouldShowAppSidebar(pathname: string | null): boolean {
  if (!pathname) {
    return true;
  }

  const path = normalizeAppPathname(pathname);

  if (path === "/") {
    return false;
  }

  return !APP_SIDEBAR_EXCLUDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
