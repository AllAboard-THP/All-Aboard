"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  AppSidebar,
  type AppSidebarLinkProps,
} from "@allaboard/ui/patterns/app-sidebar";
import {
  buildAppSidebarSections,
  resolveAppSidebarContext,
  type AppSidebarLabelMap,
  type AppSidebarNavId,
} from "@allaboard/ui/patterns/app-sidebar-nav";

import { Link, usePathname } from "@/i18n/navigation";
import { useAuthRole } from "@/lib/use-auth-role";

function AppSidebarLink({ href, className, children, ...rest }: AppSidebarLinkProps) {
  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

function useSidebarLabelMap(): AppSidebarLabelMap {
  const t = useTranslations("studentDashboard.sidebar");

  return useMemo(
    (): AppSidebarLabelMap => ({
      navigationGroup: t("navigationGroup"),
      communityGroup: t("communityGroup"),
      mentorGroup: t("mentorGroup"),
      adminGroup: t("adminGroup"),
      expandSidebar: t("expandSidebar"),
      collapseSidebar: t("collapseSidebar"),
      openMenu: t("openMenu"),
      closeMenu: t("closeMenu"),
      dashboard: t("dashboard"),
      subjects: t("subjects"),
      resources: t("resources"),
      events: t("events"),
      newRequest: t("newRequest"),
      feed: t("feed"),
      messages: t("messages"),
      mentor: t("mentor"),
      profile: t("profile"),
      admin: t("adminOverview"),
      adminUsers: t("adminUsers"),
      adminModeration: t("adminModeration"),
    }),
    [t],
  );
}

export function AppShellSidebarContent({
  forceExpanded = false,
  className,
  messageCount = 0,
  showMentorDot = false,
  isMentor = false,
  isAdmin = false,
}: {
  forceExpanded?: boolean;
  className?: string;
  messageCount?: number;
  showMentorDot?: boolean;
  isMentor?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const labelMap = useSidebarLabelMap();

  const resolved = useMemo(
    () =>
      resolveAppSidebarContext(pathname, {
        isMentor,
        isAdmin,
      }),
    [pathname, isMentor, isAdmin, labelMap],
  );

  const sections = useMemo(
    () =>
      buildAppSidebarSections(labelMap, {
        activeId: resolved.activeId,
        showMentorSection: resolved.showMentorSection,
        showAdminSection: resolved.showAdminSection,
      }),
    [labelMap, resolved.activeId, resolved.showMentorSection, resolved.showAdminSection],
  );

  const badges = useMemo(
    (): Partial<Record<AppSidebarNavId, number>> =>
      messageCount > 0 ? { messages: messageCount } : {},
    [messageCount],
  );

  return (
    <AppSidebar
      labels={{
        navigationGroup: labelMap.navigationGroup,
        communityGroup: labelMap.communityGroup,
        mentorGroup: labelMap.mentorGroup,
        adminGroup: labelMap.adminGroup,
        expandSidebar: labelMap.expandSidebar,
        collapseSidebar: labelMap.collapseSidebar,
      }}
      sections={sections}
      openSectionIds={resolved.openSectionIds}
      badges={badges}
      mentorDot={showMentorDot}
      LinkComponent={AppSidebarLink}
      forceExpanded={forceExpanded}
      className={className}
    />
  );
}

export function AppShellSidebar() {
  const { isMentor, isAdmin } = useAuthRole();

  return <AppShellSidebarContent isMentor={isMentor} isAdmin={isAdmin} />;
}
