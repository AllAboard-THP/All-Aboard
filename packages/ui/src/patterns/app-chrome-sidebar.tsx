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
    adminGroup: s.adminGroup,
    expandSidebar: s.expandSidebar,
    collapseSidebar: s.collapseSidebar,
    openMenu: s.openMenu,
    closeMenu: s.closeMenu,
    dashboard: s.dashboard,
    subjects: s.subjects,
    resources: s.resources,
    events: s.events,
    feed: s.feed,
    messages: s.messages,
    mentor: s.mentor,
    profile: s.profile,
    admin: s.admin,
    "context.dashboard.title": s.context.dashboard.title,
    "context.dashboard.description": s.context.dashboard.description,
    "context.dashboard.demo": s.context.dashboard.demo,
    "context.subjects.title": s.context.subjects.title,
    "context.subjects.explore": s.context.subjects.explore,
    "context.resources.title": s.context.resources.title,
    "context.resources.all": s.context.resources.all,
    "context.events.title": s.context.events.title,
    "context.events.all": s.context.events.all,
    "context.feed.title": s.context.feed.title,
    "context.feed.description": s.context.feed.description,
    "context.feed.newRequest": s.context.feed.newRequest,
    "context.feed.backToFeed": s.context.feed.backToFeed,
    "context.messages.title": s.context.messages.title,
    "context.messages.inbox": s.context.messages.inbox,
    "context.mentor.title": s.context.mentor.title,
    "context.mentor.space": s.context.mentor.space,
    "context.mentor.demo": s.context.mentor.demo,
    "context.profile.title": s.context.profile.title,
    "context.profile.view": s.context.profile.view,
    "context.admin.title": s.context.admin.title,
    "context.admin.description": s.context.admin.description,
    "context.admin.overview": s.context.admin.overview,
    "context.admin.users": s.context.admin.users,
    "context.admin.moderation": s.context.admin.moderation,
  };
}

export function AppChromeSidebar({
  activeId,
  legacyNav,
  mockPathname,
  messageCount = 0,
  showMentorDot = false,
  isAdmin = false,
}: {
  activeId?: AppSidebarNavId;
  legacyNav?: "feed" | "explore" | "resources" | "events" | "messages";
  mockPathname?: string;
  messageCount?: number;
  showMentorDot?: boolean;
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
        isAdmin,
        labelMap,
      }),
    [pathname, isAdmin, labelMap],
  );

  const sections = useMemo(
    () =>
      buildAppSidebarSections(labelMap, {
        activeId: resolved.activeId,
        showAdminSection: resolved.showAdminSection,
      }),
    [labelMap, resolved.activeId, resolved.showAdminSection],
  );

  const badges: Partial<Record<AppSidebarNavId, number>> =
    messageCount > 0 ? { messages: messageCount } : {};

  return (
    <AppSidebar
      labels={{
        navigationGroup: labelMap.navigationGroup,
        communityGroup: labelMap.communityGroup,
        adminGroup: labelMap.adminGroup,
        expandSidebar: labelMap.expandSidebar,
        collapseSidebar: labelMap.collapseSidebar,
      }}
      sections={sections}
      context={resolved.context}
      activeId={resolved.activeId}
      openSectionIds={resolved.openSectionIds}
      badges={badges}
      mentorDot={showMentorDot}
      onItemClick={(id) => legacyDemoToast(id)}
    />
  );
}

export { buildLabelMap as buildAppSidebarLabelMapFromDashboardLabels };
