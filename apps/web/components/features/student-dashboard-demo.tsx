"use client";

import { StudentDashboardScreen } from "@allaboard/ui/patterns/student-dashboard-screen";
import type { StudentDashboardLabels } from "@allaboard/ui/patterns/student-dashboard-labels";
import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
} from "@allaboard/ui/patterns/fixtures/student-dashboard";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

export function StudentDashboardDemo() {
  const locale = useLocale();
  const t = useTranslations("studentDashboard");
  const year = new Date().getFullYear();

  const labels: StudentDashboardLabels = {
    brandName: t("brandName"),
    chrome: {
      footerRights: () => t("chrome.footerRights", { year }),
      footerCgu: t("chrome.footerCgu"),
      footerPrivacy: t("chrome.footerPrivacy"),
      footerLegal: t("chrome.footerLegal"),
    },
    sidebar: {
      navigationGroup: t("sidebar.navigationGroup"),
      communityGroup: t("sidebar.communityGroup"),
      adminGroup: t("sidebar.adminGroup"),
      expandSidebar: t("sidebar.expandSidebar"),
      collapseSidebar: t("sidebar.collapseSidebar"),
      openMenu: t("sidebar.openMenu"),
      closeMenu: t("sidebar.closeMenu"),
      dashboard: t("sidebar.dashboard"),
      subjects: t("sidebar.subjects"),
      resources: t("sidebar.resources"),
      events: t("sidebar.events"),
      feed: t("sidebar.feed"),
      messages: t("sidebar.messages"),
      mentor: t("sidebar.mentor"),
      profile: t("sidebar.profile"),
      admin: t("sidebar.admin"),
      settings: t("sidebar.settings"),
      signOut: t("sidebar.signOut"),
      context: {
        dashboard: {
          title: t("sidebar.context.dashboard.title"),
          description: t("sidebar.context.dashboard.description"),
          demo: t("sidebar.context.dashboard.demo"),
        },
        subjects: {
          title: t("sidebar.context.subjects.title"),
          explore: t("sidebar.context.subjects.explore"),
        },
        resources: {
          title: t("sidebar.context.resources.title"),
          all: t("sidebar.context.resources.all"),
        },
        events: {
          title: t("sidebar.context.events.title"),
          all: t("sidebar.context.events.all"),
        },
        feed: {
          title: t("sidebar.context.feed.title"),
          description: t("sidebar.context.feed.description"),
          newRequest: t("sidebar.context.feed.newRequest"),
          backToFeed: t("sidebar.context.feed.backToFeed"),
        },
        messages: {
          title: t("sidebar.context.messages.title"),
          inbox: t("sidebar.context.messages.inbox"),
        },
        mentor: {
          title: t("sidebar.context.mentor.title"),
          space: t("sidebar.context.mentor.space"),
          demo: t("sidebar.context.mentor.demo"),
        },
        profile: {
          title: t("sidebar.context.profile.title"),
          view: t("sidebar.context.profile.view"),
        },
        admin: {
          title: t("sidebar.context.admin.title"),
          description: t("sidebar.context.admin.description"),
          overview: t("sidebar.context.admin.overview"),
          users: t("sidebar.context.admin.users"),
          moderation: t("sidebar.context.admin.moderation"),
        },
      },
    },
    header: {
      greetingPrefix: t("header.greetingPrefix"),
      greetingSuffix: t("header.greetingSuffix"),
      subtitle: t("header.subtitle"),
      statPosts: t("header.statPosts"),
      statReplies: t("header.statReplies"),
      statRating: t("header.statRating"),
    },
    panels: {
      helpRequestsTitle: t("panels.helpRequestsTitle"),
      helpRequestsEmpty: t("panels.helpRequestsEmpty"),
      helpRequestsCta: t("panels.helpRequestsCta"),
      upcomingTitle: t("panels.upcomingTitle"),
      resourcesTitle: t("panels.resourcesTitle"),
      resourcesEmpty: t("panels.resourcesEmpty"),
      resourcesCta: t("panels.resourcesCta"),
      subjectsTitle: t("panels.subjectsTitle"),
      subjectsEmpty: t("panels.subjectsEmpty"),
      subjectsCta: t("panels.subjectsCta"),
      unansweredTitle: t("panels.unansweredTitle"),
      unansweredEmpty: t("panels.unansweredEmpty"),
      demoToast: t("panels.demoToast"),
    },
  };

  const fixture = locale === "en" ? studentDashboardFixtureEn : studentDashboardFixtureFr;

  return (
    <StudentDashboardScreen
      labels={labels}
      fixture={fixture}
      variant="content"
      onDemoAction={(message) => toast.message(message)}
    />
  );
}
