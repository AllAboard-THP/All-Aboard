"use client";

import { useTranslations } from "next-intl";

import {
  AppSidebar,
  type AppSidebarLinkProps,
} from "@allaboard/ui/patterns/app-sidebar";
import {
  APP_SIDEBAR_NAV,
  buildAppSidebarItems,
  type AppSidebarNavId,
} from "@allaboard/ui/patterns/app-sidebar-nav";

import { isAppSidebarItemActive } from "@/lib/app-shell-sidebar";

import { Link, usePathname } from "@/i18n/navigation";

function AppSidebarLink({ href, className, children, ...rest }: AppSidebarLinkProps) {
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

function resolveActiveSidebarId(pathname: string | null): AppSidebarNavId | undefined {
  if (!pathname) {
    return undefined;
  }

  for (const def of APP_SIDEBAR_NAV) {
    if (isAppSidebarItemActive(pathname, def.href)) {
      return def.id;
    }
  }

  return undefined;
}

export function AppShellSidebar() {
  const pathname = usePathname();
  const t = useTranslations("studentDashboard.sidebar");
  const activeId = resolveActiveSidebarId(pathname);

  const labelMap = {
    navigationGroup: t("navigationGroup"),
    communityGroup: t("communityGroup"),
    dashboard: t("dashboard"),
    subjects: t("subjects"),
    resources: t("resources"),
    events: t("events"),
    feed: t("feed"),
    messages: t("messages"),
    mentor: t("mentor"),
    profile: t("profile"),
  };

  const { labels, navigationItems, communityItems } = buildAppSidebarItems(labelMap, activeId);

  return (
    <AppSidebar
      labels={labels}
      navigationItems={navigationItems}
      communityItems={communityItems}
      LinkComponent={AppSidebarLink}
    />
  );
}
