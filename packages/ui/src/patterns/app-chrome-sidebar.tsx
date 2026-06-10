"use client";

import { useMemo } from "react";

import { AppSidebar } from "./app-sidebar";
import {
  buildAppSidebarSections,
  resolveAppSidebarContext,
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
    events: s.events,
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
  showMentorDot = false,
  isMentor = false,
  isAdmin = false,
}: {
  activeId?: AppSidebarNavId;
  legacyNav?: "feed" | "explore" | "resources" | "events" | "messages";
  mockPathname?: string;
  messageCount?: number;
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

  const badges: Partial<Record<AppSidebarNavId, number>> =
    messageCount > 0 ? { messages: messageCount } : {};

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
      onItemClick={(id) => legacyDemoToast(id)}
    />
  );
}

export { buildLabelMap as buildAppSidebarLabelMapFromDashboardLabels };
