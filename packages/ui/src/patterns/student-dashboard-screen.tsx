"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Compass,
  Library,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { cn } from "../lib/utils";
import {
  studentDashboardFixtureFr,
  type StudentDashboardFixture,
  type StudentHelpRequestPreview,
  type StudentResourcePreview,
  type StudentSubjectPreview,
  type StudentUpcomingTeaser,
} from "./fixtures/student-dashboard";
import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeHeader,
} from "./app-chrome-shell";
import { AppChromeSidebar } from "./app-chrome-sidebar";
import { AppChromeUserMenu } from "./app-chrome-user-menu";
import { AppSidebarProvider } from "./app-sidebar-provider";
import {
  APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
  APP_GLASS_CARD_CLASS,
  APP_STAGE_CLASS,
  LANDING_EDGE_PADDING_CLASS,
} from "./landing-layout";
import {
  studentDashboardLabelsFr,
  type StudentDashboardLabels,
} from "./student-dashboard-labels";
import { AppAbstractBackground } from "./app-abstract-background";

export type StudentDashboardVariant = "standalone" | "content";

function DashboardStage({ children }: { children: ReactNode }) {
  return (
    <div className={cn(APP_STAGE_CLASS, "dashboard-stage relative flex min-h-[100dvh] flex-col")}>
      <AppAbstractBackground />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">{children}</div>
    </div>
  );
}

function StatCard({
  value,
  label,
  tone = "primary",
}: {
  value: string | number;
  label: string;
  tone?: "primary" | "accent" | "gradient";
}) {
  const valueClass = {
    primary: "text-primary",
    accent: "text-accent",
    gradient: "gradient-text",
  }[tone];

  return (
    <div className="dashboard-stat-card flex-1">
      <p className={cn("text-2xl font-bold sm:text-3xl", valueClass)}>{value}</p>
      <p className="landing-eyebrow mt-1 text-[10px] text-muted-foreground normal-case tracking-wide">
        {label}
      </p>
    </div>
  );
}

function StudentDashboardTopHeader({
  labels,
  fixture,
  headerEnd,
}: {
  labels: StudentDashboardLabels;
  fixture: StudentDashboardFixture;
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
        />
      </div>
    </AppChromeHeader>
  );
}

function DashboardPanel({
  title,
  icon: Icon,
  children,
  footer,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className={cn(APP_GLASS_CARD_CLASS, "dashboard-glass-card gap-0 rounded-2xl py-0 shadow-none")}>
      <CardHeader className="flex-row items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
          <Icon className="size-4 text-primary" aria-hidden />
        </span>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="justify-center border-t border-white/10 px-5 py-4">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
  );
}

function HelpRequestPreviewCard({ item }: { item: StudentHelpRequestPreview }) {
  return (
    <div className="dashboard-inner-card">
      <div className="mb-2 flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-transparent text-xs"
          style={{
            color: item.subjectColor,
            backgroundColor: `${item.subjectColor}18`,
          }}
        >
          {item.subjectName}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground">{item.timeAgo}</span>
      </div>
      <p className="text-sm font-medium leading-snug">{item.title}</p>
    </div>
  );
}

function ResourcePreviewCard({ item }: { item: StudentResourcePreview }) {
  return (
    <div className="dashboard-inner-card">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        <span className="shrink-0 text-xs text-muted-foreground">{item.timeAgo}</span>
      </div>
      <p className="text-sm text-muted-foreground">{item.excerpt}</p>
    </div>
  );
}

function SubjectChip({ item }: { item: StudentSubjectPreview }) {
  return (
    <div className="dashboard-inner-card flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className="size-2.5 shrink-0 rounded-full shadow-[0_0_10px_currentColor]"
          style={{ color: item.color, backgroundColor: item.color }}
          aria-hidden
        />
        <span className="text-sm font-medium">{item.name}</span>
      </div>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
        {item.progressLabel}
      </span>
    </div>
  );
}

function UpcomingTeaserCard({ item }: { item: StudentUpcomingTeaser }) {
  return (
    <div className="dashboard-inner-card">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <p className="text-sm font-medium">{item.title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
  );
}

function DemoLinkButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className="dashboard-hover-link gap-2 rounded-full text-primary hover:text-foreground"
      onClick={onClick}
    >
      {label}
      <ArrowRight className="size-4" aria-hidden />
    </Button>
  );
}

function StudentDashboardFooter({
  labels,
  onDemoClick,
}: {
  labels: StudentDashboardLabels;
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

function StudentDashboardMain({
  labels,
  fixture,
  onDemoClick,
}: {
  labels: StudentDashboardLabels;
  fixture: StudentDashboardFixture;
  onDemoClick: () => void;
}) {
  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
      <div className="space-y-3">
        <span className="dashboard-date-badge">{fixture.dateLabel}</span>
        <div>
          <h1 className="landing-hero-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="landing-chrome-text">{labels.header.greetingPrefix}</span>{" "}
            <span className="gradient-text">
              {fixture.firstName}
              {labels.header.greetingSuffix}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">{labels.header.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard value={fixture.postsCount} label={labels.header.statPosts} tone="primary" />
        <StatCard value={fixture.repliesCount} label={labels.header.statReplies} tone="accent" />
        <StatCard
          value={fixture.communityRating}
          label={labels.header.statRating}
          tone="gradient"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <DashboardPanel
            title={labels.panels.helpRequestsTitle}
            icon={Zap}
            footer={
              <DemoLinkButton label={labels.panels.helpRequestsCta} onClick={onDemoClick} />
            }
          >
            {fixture.helpRequests.length > 0 ? (
              <div className="space-y-3">
                {fixture.helpRequests.map((item) => (
                  <HelpRequestPreviewCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState message={labels.panels.helpRequestsEmpty} />
            )}
          </DashboardPanel>

          <DashboardPanel title={labels.panels.upcomingTitle} icon={Sparkles}>
            <div className="space-y-3">
              {fixture.upcoming.map((item) => (
                <UpcomingTeaserCard key={item.id} item={item} />
              ))}
            </div>
          </DashboardPanel>
        </div>

        <div className="space-y-6">
          <DashboardPanel
            title={labels.panels.subjectsTitle}
            icon={Compass}
            footer={
              <DemoLinkButton label={labels.panels.subjectsCta} onClick={onDemoClick} />
            }
          >
            {fixture.subjects.length > 0 ? (
              <div className="space-y-3">
                {fixture.subjects.map((item) => (
                  <SubjectChip key={item.slug} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState message={labels.panels.subjectsEmpty} />
            )}
          </DashboardPanel>

          <DashboardPanel title={labels.panels.unansweredTitle} icon={Users}>
            {fixture.unansweredCount > 0 ? (
              <p className="text-center text-3xl font-bold text-primary">
                {fixture.unansweredCount}
              </p>
            ) : (
              <EmptyState message={labels.panels.unansweredEmpty} />
            )}
          </DashboardPanel>
        </div>
      </div>

      <DashboardPanel
        title={labels.panels.resourcesTitle}
        icon={Library}
        footer={<DemoLinkButton label={labels.panels.resourcesCta} onClick={onDemoClick} />}
      >
        {fixture.resources.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {fixture.resources.map((item) => (
              <ResourcePreviewCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState message={labels.panels.resourcesEmpty} />
        )}
      </DashboardPanel>
    </div>
  );
}

export function StudentDashboardScreen({
  labels = studentDashboardLabelsFr,
  fixture = studentDashboardFixtureFr,
  onDemoAction,
  headerEnd,
  variant = "standalone",
}: {
  labels?: StudentDashboardLabels;
  fixture?: StudentDashboardFixture;
  onDemoAction?: (message: string) => void;
  headerEnd?: ReactNode;
  /** `content` = main panels only (sidebar/header from AppShell). */
  variant?: StudentDashboardVariant;
}) {
  const handleDemoClick = () => {
    onDemoAction?.(labels.panels.demoToast);
  };

  if (variant === "content") {
    return (
      <StudentDashboardMain
        labels={labels}
        fixture={fixture}
        onDemoClick={handleDemoClick}
      />
    );
  }

  return (
    <DashboardStage>
      <AppSidebarProvider>
        <StudentDashboardTopHeader
          labels={labels}
          fixture={fixture}
          headerEnd={headerEnd}
        />

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <AppChromeSidebar activeId="dashboard" />

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <StudentDashboardMain
              labels={labels}
              fixture={fixture}
              onDemoClick={handleDemoClick}
            />
          </main>
        </div>

        <StudentDashboardFooter labels={labels} onDemoClick={handleDemoClick} />
      </AppSidebarProvider>
    </DashboardStage>
  );
}
