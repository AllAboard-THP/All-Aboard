"use client";

import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import { cn } from "../lib/utils";
import {
  legacyLabelsEn,
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import {
  mentorDashboardFixtureFr,
  type MentorDashboardFixture,
} from "./fixtures/mentor-dashboard";
import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeHeader,
} from "./app-chrome-shell";
import { AppChromeSidebar } from "./app-chrome-sidebar";
import { AppChromeUserMenu } from "./app-chrome-user-menu";
import { AppSidebarProvider } from "./app-sidebar-provider";
import {
  MentorHelpPanel,
  MentorValidationPanel,
} from "./legacy-mentor-patterns";
import {
  APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
  APP_GLASS_CARD_CLASS,
  APP_STAGE_CLASS,
  LANDING_EDGE_PADDING_CLASS,
} from "./landing-layout";
import {
  mentorDashboardLabelsFr,
  type MentorDashboardLabels,
} from "./mentor-dashboard-labels";
import { AppAbstractBackground } from "./app-abstract-background";

export type MentorDashboardVariant = "standalone" | "content";

function DashboardStage({ children }: { children: ReactNode }) {
  return (
    <div className={cn(APP_STAGE_CLASS, "dashboard-stage relative flex min-h-[100dvh] flex-col")}>
      <AppAbstractBackground />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">{children}</div>
    </div>
  );
}

function MentorStatCard({
  value,
  label,
  tone = "emerald",
  highlight = false,
}: {
  value: string | number;
  label: string;
  tone?: "emerald" | "yellow" | "orange";
  highlight?: boolean;
}) {
  const valueClass = {
    emerald: "text-emerald-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
  }[tone];

  return (
    <div
      className={cn(
        "dashboard-stat-card flex-1",
        highlight && tone === "yellow" && "ring-1 ring-yellow-400/40",
        highlight && tone === "orange" && "ring-1 ring-red-400/40",
      )}
    >
      <p className={cn("text-2xl font-bold sm:text-3xl", valueClass)}>{value}</p>
      <p className="landing-eyebrow mt-1 text-[10px] text-muted-foreground normal-case tracking-wide">
        {label}
      </p>
    </div>
  );
}

function mentorLegacyLabels(
  labels: MentorDashboardLabels,
  locale: "fr" | "en" = "fr",
): LegacyLabels {
  const base = locale === "en" ? legacyLabelsEn : legacyLabelsFr;
  return { ...base, mentor: labels.mentor };
}

function MentorDashboardTopHeader({
  labels,
  fixture,
  headerEnd,
}: {
  labels: MentorDashboardLabels;
  fixture: MentorDashboardFixture;
  headerEnd?: ReactNode;
}) {
  return (
    <AppChromeHeader
      layout="surface"
      className={cn(
        "sticky top-0 z-20 grid shrink-0 grid-cols-[1fr_auto]",
        APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
      )}
    >
      <div className="flex min-h-[4.25rem] shrink-0 items-center gap-3 overflow-visible px-3 sm:min-h-[4.75rem] sm:px-4">
        <AppChromeBrand brandName={labels.brandName} />
      </div>
      <div className="flex min-h-[4.25rem] flex-wrap items-center justify-end gap-2 px-3 sm:min-h-[4.75rem] sm:gap-3 sm:px-4 md:px-6 lg:px-8">
        {headerEnd}
        <AppChromeUserMenu
          userName={fixture.fullName}
          userInitials={fixture.initials}
          isMentor
        />
      </div>
    </AppChromeHeader>
  );
}

function MentorDashboardFooter({
  labels,
  onDemoClick,
}: {
  labels: MentorDashboardLabels;
  onDemoClick: () => void;
}) {
  const year = new Date().getFullYear();
  const legalLinks = [
    { id: "cgu", label: labels.chrome.footerCgu },
    { id: "privacy", label: labels.chrome.footerPrivacy },
    { id: "legal", label: labels.chrome.footerLegal },
  ] as const;

  return (
    <AppChromeFooter className="relative z-10 shrink-0">
      <div
        className={cn(
          LANDING_EDGE_PADDING_CLASS,
          "flex flex-col items-center justify-between gap-4 md:flex-row",
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
          <AllAboardLogoMark className="size-5" title={labels.brandName} />
          <span className="gradient-text font-semibold">{labels.brandName}</span>
          <span>{labels.chrome.footerRights(year)}</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4" aria-label="Legal">
          {legalLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={onDemoClick}
              className="dashboard-hover-link rounded-md px-2 py-1 text-sm text-muted-foreground"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </AppChromeFooter>
  );
}

function MentorDashboardMain({
  labels,
  fixture,
  locale = "fr",
}: {
  labels: MentorDashboardLabels;
  fixture: MentorDashboardFixture;
  locale?: "fr" | "en";
}) {
  const panelLabels = mentorLegacyLabels(labels, locale);
  const hasPending = fixture.pendingCount > 0;
  const hasHelp = fixture.helpCount > 0;

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
      <div className="space-y-3">
        <span className="dashboard-date-badge">{fixture.dateLabel}</span>
        <div>
          <h1 className="landing-hero-heading flex flex-wrap items-center gap-3 text-3xl font-bold tracking-tight sm:text-4xl">
            <GraduationCap className="size-8 shrink-0 text-emerald-400 sm:size-9" aria-hidden />
            <span className="landing-chrome-text">{labels.header.greetingPrefix}</span>{" "}
            <span className="gradient-text">
              {fixture.firstName}
              {labels.header.greetingSuffix}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{labels.header.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MentorStatCard
          value={fixture.publishedCount}
          label={labels.header.statPublished}
          tone="emerald"
        />
        <MentorStatCard
          value={fixture.pendingCount}
          label={labels.header.statPending}
          tone="yellow"
          highlight={hasPending}
        />
        <MentorStatCard
          value={fixture.helpCount}
          label={labels.header.statHelp}
          tone="orange"
          highlight={hasHelp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MentorHelpPanel
          posts={fixture.helpPosts}
          labels={panelLabels}
          className={cn(APP_GLASS_CARD_CLASS, "dashboard-glass-card mb-0 border-0 shadow-none")}
        />
        <MentorValidationPanel
          resources={fixture.pendingResources}
          labels={panelLabels}
          className="dashboard-glass-card shadow-none"
        />
      </div>
    </div>
  );
}

export function MentorDashboardScreen({
  labels = mentorDashboardLabelsFr,
  fixture = mentorDashboardFixtureFr,
  onDemoAction,
  headerEnd,
  variant = "standalone",
  locale = "fr",
}: {
  labels?: MentorDashboardLabels;
  fixture?: MentorDashboardFixture;
  onDemoAction?: (message: string) => void;
  headerEnd?: ReactNode;
  variant?: MentorDashboardVariant;
  locale?: "fr" | "en";
}) {
  const handleDemoClick = () => {
    onDemoAction?.(labels.panels.demoToast);
  };

  if (variant === "content") {
    return (
      <MentorDashboardMain labels={labels} fixture={fixture} locale={locale} />
    );
  }

  return (
    <DashboardStage>
      <AppSidebarProvider>
        <MentorDashboardTopHeader
          labels={labels}
          fixture={fixture}
          headerEnd={headerEnd}
        />

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <AppChromeSidebar activeId="mentor" showMentorDot />

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <MentorDashboardMain labels={labels} fixture={fixture} locale={locale} />
          </main>
        </div>

        <MentorDashboardFooter labels={labels} onDemoClick={handleDemoClick} />
      </AppSidebarProvider>
    </DashboardStage>
  );
}
