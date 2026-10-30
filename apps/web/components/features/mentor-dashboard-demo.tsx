"use client";

import { MentorDashboardScreen } from "@allaboard/ui/patterns/mentor-dashboard-screen";
import type { MentorDashboardLabels } from "@allaboard/ui/patterns/mentor-dashboard-labels";
import {
  mentorDashboardFixtureEn,
  mentorDashboardFixtureFr,
} from "@allaboard/ui/patterns/fixtures/mentor-dashboard";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

export function MentorDashboardDemo() {
  const locale = useLocale();
  const t = useTranslations("mentorDashboard");
  const year = new Date().getFullYear();

  const labels: MentorDashboardLabels = {
    brandName: t("brandName"),
    chrome: {
      footerRights: () => t("chrome.footerRights", { year }),
      footerCgu: t("chrome.footerCgu"),
      footerPrivacy: t("chrome.footerPrivacy"),
      footerLegal: t("chrome.footerLegal"),
    },
    header: {
      greetingPrefix: t("header.greetingPrefix"),
      greetingSuffix: t("header.greetingSuffix"),
      subtitle: t("header.subtitle"),
      statPublished: t("header.statPublished"),
      statPending: t("header.statPending"),
      statHelp: t("header.statHelp"),
    },
    mentor: {
      title: t("mentor.title"),
      subtitle: t("mentor.subtitle"),
      statsPublished: t("mentor.statsPublished"),
      statsPending: t("mentor.statsPending"),
      statsHelp: t("mentor.statsHelp"),
      actionRequired: t("mentor.actionRequired"),
      helpPanelTitle: t("mentor.helpPanelTitle"),
      helpEmpty: t("mentor.helpEmpty"),
      helpCta: t("mentor.helpCta"),
      validationPanelTitle: t("mentor.validationPanelTitle"),
      approve: t("mentor.approve"),
      reject: t("mentor.reject"),
      validationEmpty: t("mentor.validationEmpty"),
      submittedPrefix: t("mentor.submittedPrefix"),
    },
    panels: {
      demoToast: t("panels.demoToast"),
    },
  };

  const fixture = locale === "en" ? mentorDashboardFixtureEn : mentorDashboardFixtureFr;

  return (
    <MentorDashboardScreen
      labels={labels}
      fixture={fixture}
      locale={locale === "en" ? "en" : "fr"}
      variant="content"
      onDemoAction={(message) => toast.message(message)}
    />
  );
}
