"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  AppSidebar,
  type AppSidebarLinkProps,
} from "@allaboard/ui/patterns/app-sidebar";
import {
  buildAppSidebarSections,
  buildSidebarContextPanelLabels,
  resolveAppSidebarContext,
  resolveAppSidebarContextPanel,
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

function useSidebarContextSource() {
  const t = useTranslations("studentDashboard.sidebar.context");

  return useMemo(
    () => ({
      dashboard: {
        title: t("dashboard.title"),
        description: t("dashboard.description"),
        newRequest: t("dashboard.newRequest"),
        browseFeed: t("dashboard.browseFeed"),
        inbox: t("dashboard.inbox"),
        myRequests: t("dashboard.myRequests"),
      },
      subjects: {
        title: t("subjects.title"),
        explore: t("subjects.explore"),
      },
      resources: {
        title: t("resources.title"),
        all: t("resources.all"),
      },
      newRequest: {
        title: t("newRequest.title"),
        description: t("newRequest.description"),
        create: t("newRequest.create"),
        backToFeed: t("newRequest.backToFeed"),
      },
      feed: {
        title: t("feed.title"),
        description: t("feed.description"),
        browse: t("feed.browse"),
        newRequest: t("feed.newRequest"),
        backToFeed: t("feed.backToFeed"),
      },
      messages: {
        title: t("messages.title"),
        inbox: t("messages.inbox"),
      },
      mentor: {
        title: t("mentor.title"),
        space: t("mentor.space"),
      },
      profile: {
        title: t("profile.title"),
        view: t("profile.view"),
      },
      admin: {
        title: t("admin.title"),
        description: t("admin.description"),
        overview: t("admin.overview"),
        users: t("admin.users"),
        moderation: t("admin.moderation"),
      },
    }),
    [t],
  );
}

export function AppShellSidebarContent({
  forceExpanded = false,
  className,
  messageCount = 0,
  feedCount = 0,
  dashboardCount = 0,
  showMentorDot = false,
  isMentor = false,
  isAdmin = false,
}: {
  forceExpanded?: boolean;
  className?: string;
  messageCount?: number;
  feedCount?: number;
  dashboardCount?: number;
  showMentorDot?: boolean;
  isMentor?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const labelMap = useSidebarLabelMap();
  const contextSource = useSidebarContextSource();

  const resolved = useMemo(
    () =>
      resolveAppSidebarContext(pathname, {
        isMentor,
        isAdmin,
      }),
    [pathname, isMentor, isAdmin],
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

  const badges = useMemo((): Partial<Record<AppSidebarNavId, number>> => {
    const next: Partial<Record<AppSidebarNavId, number>> = {};
    if (dashboardCount > 0) next.dashboard = dashboardCount;
    if (feedCount > 0) next.feed = feedCount;
    if (messageCount > 0) next.messages = messageCount;
    return next;
  }, [dashboardCount, feedCount, messageCount]);

  const contextPanelLabels = useMemo(
    () => buildSidebarContextPanelLabels(resolved.activeId, contextSource),
    [resolved.activeId, contextSource],
  );

  const contextPanel = useMemo(
    () => resolveAppSidebarContextPanel(resolved.activeId, contextPanelLabels),
    [resolved.activeId, contextPanelLabels],
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
      contextPanel={contextPanel}
      contextLinkLabels={contextPanelLabels?.links}
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
