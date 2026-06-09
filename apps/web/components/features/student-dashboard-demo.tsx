"use client";

import { StudentDashboardScreen } from "@allaboard/ui/patterns/student-dashboard-screen";
import type { StudentDashboardLabels } from "@allaboard/ui/patterns/student-dashboard-labels";
import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
} from "@allaboard/ui/patterns/fixtures/student-dashboard";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { LocaleSwitcher } from "@/components/features/locale-switcher";

export function StudentDashboardDemo() {
  const locale = useLocale();
  const t = useTranslations("studentDashboard");
  const year = new Date().getFullYear();

  const labels: StudentDashboardLabels = {
    brandName: t("brandName"),
    chrome: {
      demoBadge: t("chrome.demoBadge"),
      footerRights: () => t("chrome.footerRights", { year }),
      footerCgu: t("chrome.footerCgu"),
      footerPrivacy: t("chrome.footerPrivacy"),
      footerLegal: t("chrome.footerLegal"),
    },
    sidebar: {
      navigationGroup: t("sidebar.navigationGroup"),
      communityGroup: t("sidebar.communityGroup"),
      dashboard: t("sidebar.dashboard"),
      subjects: t("sidebar.subjects"),
      resources: t("sidebar.resources"),
      events: t("sidebar.events"),
      feed: t("sidebar.feed"),
      messages: t("sidebar.messages"),
      mentor: t("sidebar.mentor"),
      profile: t("sidebar.profile"),
      settings: t("sidebar.settings"),
      signOut: t("sidebar.signOut"),
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
      headerEnd={<LocaleSwitcher />}
      onDemoAction={(message) => toast.message(message)}
    />
  );
}
