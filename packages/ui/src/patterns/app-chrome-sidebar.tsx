"use client";

import { useMemo } from "react";

import { AppSidebar } from "./app-sidebar";
import {
  buildAppSidebarSections,
  buildSidebarContextPanelLabels,
  resolveAppSidebarContext,
  resolveAppSidebarContextPanel,
  resolveAppSidebarPathname,
  resolveSidebarActiveId,
  type AppSidebarLabelMap,
  type AppSidebarNavId,
} from "./app-sidebar-nav";
import {
  studentDashboardLabelsEn,
  studentDashboardLabelsFr,
  type StudentDashboardLabels,
} from "./student-dashboard-labels";
import { useStorybookLocale } from "../i18n/storybook-locale";
import { legacyDemoToast } from "./legacy-story-feedback";

function buildLabelMap(labels: StudentDashboardLabels): AppSidebarLabelMap {
  const { sidebar: s } = labels;
  return {
    navigationGroup: s.navigationGroup,
    communityGroup: s.communityGroup,
    mentorGroup: s.mentorGroup,
    adminGroup: s.adminGroup,
    expandSidebar: s.expandSidebar,
    collapseSidebar: s.collapseSidebar,
    openMenu: s.openMenu,
    closeMenu: s.closeMenu,
    dashboard: s.dashboard,
    subjects: s.subjects,
    resources: s.resources,
    newRequest: s.newRequest,
    feed: s.feed,
    messages: s.messages,
    mentor: s.mentor,
    profile: s.profile,
    admin: s.adminOverview,
    adminUsers: s.adminUsers,
    adminModeration: s.adminModeration,
  };
}

export function AppChromeSidebar({
  activeId,
  legacyNav,
  mockPathname,
  messageCount = 0,
  feedCount = 0,
  dashboardCount = 0,
  showMentorDot = false,
  isMentor = false,
  isAdmin = false,
}: {
  activeId?: AppSidebarNavId;
  legacyNav?: "feed" | "explore" | "resources" | "events" | "messages";
  mockPathname?: string;
  messageCount?: number;
  feedCount?: number;
  dashboardCount?: number;
  showMentorDot?: boolean;
  isMentor?: boolean;
  isAdmin?: boolean;
}) {
  const locale = useStorybookLocale();
  const dashboardLabels =
    locale === "en" ? studentDashboardLabelsEn : studentDashboardLabelsFr;
  const labelMap = useMemo(() => buildLabelMap(dashboardLabels), [dashboardLabels]);

  const resolvedActiveId = resolveSidebarActiveId(activeId, legacyNav);
  const pathname = resolveAppSidebarPathname(mockPathname, resolvedActiveId);

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
    () => buildSidebarContextPanelLabels(resolved.activeId, dashboardLabels.sidebar.context),
    [resolved.activeId, dashboardLabels.sidebar.context],
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
      onItemClick={(id) => legacyDemoToast(id)}
    />
  );
}

export { buildLabelMap as buildAppSidebarLabelMapFromDashboardLabels };
