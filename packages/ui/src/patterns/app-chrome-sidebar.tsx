"use client";

import { AppSidebar } from "./app-sidebar";
import {
  buildAppSidebarItems,
  type AppSidebarNavId,
} from "./app-sidebar-nav";
import {
  studentDashboardLabelsEn,
  studentDashboardLabelsFr,
} from "./student-dashboard-labels";
import { useStorybookLocale } from "../i18n/storybook-locale";
import { legacyDemoToast } from "./legacy-story-feedback";

export function AppChromeSidebar({ activeId }: { activeId?: AppSidebarNavId }) {
  const locale = useStorybookLocale();
  const sidebar = locale === "en" ? studentDashboardLabelsEn.sidebar : studentDashboardLabelsFr.sidebar;

  const labelMap = {
    navigationGroup: sidebar.navigationGroup,
    communityGroup: sidebar.communityGroup,
    dashboard: sidebar.dashboard,
    subjects: sidebar.subjects,
    resources: sidebar.resources,
    events: sidebar.events,
    feed: sidebar.feed,
    messages: sidebar.messages,
    mentor: sidebar.mentor,
    profile: sidebar.profile,
  };

  const { labels, navigationItems, communityItems } = buildAppSidebarItems(labelMap, activeId);

  return (
    <AppSidebar
      labels={labels}
      navigationItems={navigationItems}
      communityItems={communityItems}
      onItemClick={(id) => legacyDemoToast(id)}
    />
  );
}
