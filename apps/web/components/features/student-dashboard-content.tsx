"use client";

import type { DashboardLinkProps } from "@allaboard/ui/patterns/student-dashboard-screen";
import { StudentDashboardScreen } from "@allaboard/ui/patterns/student-dashboard-screen";
import type { StudentDashboardLabels } from "@allaboard/ui/patterns/student-dashboard-labels";
import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
  type StudentDashboardFixture,
} from "@allaboard/ui/patterns/fixtures/student-dashboard";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { APP_HOME_PATH } from "@/lib/app-routes";

function DashboardLink({ href, className, children, onClick }: DashboardLinkProps) {
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function useStudentDashboardLabels(): StudentDashboardLabels {
  const t = useTranslations("studentDashboard");
  const year = new Date().getFullYear();

  return {
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
      mentorGroup: t("sidebar.mentorGroup"),
      adminGroup: t("sidebar.adminGroup"),
      expandSidebar: t("sidebar.expandSidebar"),
      collapseSidebar: t("sidebar.collapseSidebar"),
      openMenu: t("sidebar.openMenu"),
      closeMenu: t("sidebar.closeMenu"),
      dashboard: t("sidebar.dashboard"),
      subjects: t("sidebar.subjects"),
      resources: t("sidebar.resources"),
      events: t("sidebar.events"),
      newRequest: t("sidebar.newRequest"),
      feed: t("sidebar.feed"),
      messages: t("sidebar.messages"),
      mentor: t("sidebar.mentor"),
      profile: t("sidebar.profile"),
      adminOverview: t("sidebar.adminOverview"),
      adminUsers: t("sidebar.adminUsers"),
      adminModeration: t("sidebar.adminModeration"),
      settings: t("sidebar.settings"),
      signOut: t("sidebar.signOut"),
      context: {
        dashboard: {
          title: t("sidebar.context.dashboard.title"),
          description: t("sidebar.context.dashboard.description"),
          newRequest: t("sidebar.context.dashboard.newRequest"),
          browseFeed: t("sidebar.context.dashboard.browseFeed"),
          inbox: t("sidebar.context.dashboard.inbox"),
          myRequests: t("sidebar.context.dashboard.myRequests"),
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
        newRequest: {
          title: t("sidebar.context.newRequest.title"),
          description: t("sidebar.context.newRequest.description"),
          create: t("sidebar.context.newRequest.create"),
          backToFeed: t("sidebar.context.newRequest.backToFeed"),
        },
        feed: {
          title: t("sidebar.context.feed.title"),
          description: t("sidebar.context.feed.description"),
          browse: t("sidebar.context.feed.browse"),
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
      primaryCta: t("header.primaryCta"),
    },
    inbox: {
      title: t("inbox.title"),
      empty: t("inbox.empty"),
      emptyCta: t("inbox.emptyCta"),
      overflow: (count) => t("inbox.overflow", { count }),
    },
    activity: {
      title: t("activity.title"),
      viewAll: t("activity.viewAll"),
      empty: t("activity.empty"),
    },
    shortcuts: {
      subjects: t("shortcuts.subjects"),
      resources: t("shortcuts.resources"),
      events: t("shortcuts.events"),
      profile: t("shortcuts.profile"),
    },
  };
}

type Props = {
  fixture: StudentDashboardFixture;
  loadError?: string | null;
  unauthenticated?: boolean;
};

export function StudentDashboardContent({
  fixture,
  loadError = null,
  unauthenticated = false,
}: Props) {
  const labels = useStudentDashboardLabels();
  const t = useTranslations("studentDashboard");
  const loginReturnTo = encodeURIComponent(APP_HOME_PATH);

  if (unauthenticated) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Alert data-testid="student-dashboard-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link
                  href={`/login?returnTo=${loginReturnTo}`}
                  className="text-primary underline"
                >
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Alert variant="destructive" data-testid="student-dashboard-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <StudentDashboardScreen
      labels={labels}
      fixture={fixture}
      variant="content"
      LinkComponent={DashboardLink}
    />
  );
}

/** @deprecated Use StudentDashboardContent — kept for imports during migration. */
export function StudentDashboardDemo() {
  const locale = useLocale();
  const fixture =
    locale === "en" ? studentDashboardFixtureEn : studentDashboardFixtureFr;

  return <StudentDashboardContent fixture={fixture} />;
}
