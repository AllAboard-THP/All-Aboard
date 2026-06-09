"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  MessageSquare,
  Settings,
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
  APP_GLASS_CARD_CLASS,
  APP_STAGE_CLASS,
  LANDING_EDGE_PADDING_CLASS,
} from "./landing-layout";
import {
  studentDashboardLabelsFr,
  type StudentDashboardLabels,
} from "./student-dashboard-labels";
import { AppAbstractBackground } from "./app-abstract-background";

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

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

function SidebarNavButton({
  item,
  onDemoClick,
}: {
  item: SidebarItem;
  onDemoClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onDemoClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200",
        item.active
          ? "dashboard-nav-active font-medium text-primary"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span>{item.label}</span>
    </button>
  );
}

const DASHBOARD_SIDEBAR_CLASS =
  "landing-chrome flex w-full shrink-0 flex-col border-white/10 md:w-64 md:min-h-0 md:border-r";

function StudentDashboardTopHeader({
  labels,
  headerEnd,
}: {
  labels: StudentDashboardLabels;
  headerEnd?: ReactNode;
}) {
  return (
    <header className="landing-chrome sticky top-0 z-20 grid shrink-0 grid-cols-[1fr_auto] border-b border-white/10 md:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="flex min-h-[4.25rem] items-center gap-3 px-3 py-3 sm:px-4">
        <AllAboardLogoMark className="size-10" title={labels.brandName} />
        <span className="gradient-text min-w-0 text-xl font-bold">{labels.brandName}</span>
      </div>
      <div className="flex min-h-[4.25rem] items-center justify-end gap-2 px-3 py-3 sm:gap-3 sm:px-4 md:px-6 lg:px-8">
        {headerEnd}
        <Badge
          variant="outline"
          className="rounded-full border-primary/30 bg-primary/10 text-primary"
        >
          {labels.chrome.demoBadge}
        </Badge>
      </div>
    </header>
  );
}

function StudentDashboardSidebar({
  labels,
  fixture,
  onDemoClick,
}: {
  labels: StudentDashboardLabels;
  fixture: StudentDashboardFixture;
  onDemoClick: () => void;
}) {
  const navigationItems: SidebarItem[] = [
    { id: "dashboard", label: labels.sidebar.dashboard, icon: LayoutDashboard, active: true },
    { id: "subjects", label: labels.sidebar.subjects, icon: Compass },
    { id: "resources", label: labels.sidebar.resources, icon: Library },
    { id: "events", label: labels.sidebar.events, icon: Calendar },
  ];

  const communityItems: SidebarItem[] = [
    { id: "feed", label: labels.sidebar.feed, icon: Users },
    { id: "messages", label: labels.sidebar.messages, icon: MessageSquare },
    { id: "mentor", label: labels.sidebar.mentor, icon: GraduationCap },
    { id: "profile", label: labels.sidebar.profile, icon: BookOpen },
  ];

  return (
    <aside className={DASHBOARD_SIDEBAR_CLASS}>
      <nav
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        aria-label={labels.sidebar.navigationGroup}
      >
        <div>
          <p className="landing-eyebrow mb-2 px-3">{labels.sidebar.navigationGroup}</p>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarNavButton key={item.id} item={item} onDemoClick={onDemoClick} />
            ))}
          </div>
        </div>

        <div>
          <p className="landing-eyebrow mb-2 px-3">{labels.sidebar.communityGroup}</p>
          <div className="space-y-1">
            {communityItems.map((item) => (
              <SidebarNavButton key={item.id} item={item} onDemoClick={onDemoClick} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="dashboard-inner-card flex items-center gap-3 !p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/35 to-pink-500/20 text-sm font-semibold ring-1 ring-white/15">
            {fixture.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{fixture.fullName}</p>
            <p className="text-xs text-muted-foreground">{labels.sidebar.profile}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={onDemoClick}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary"
              aria-label={labels.sidebar.settings}
            >
              <Settings className="size-4" />
            </button>
            <button
              type="button"
              onClick={onDemoClick}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary"
              aria-label={labels.sidebar.signOut}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
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
      className="gap-2 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
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
    <footer className="landing-chrome shrink-0 border-t">
      <div
        className={cn(
          LANDING_EDGE_PADDING_CLASS,
          "flex flex-col items-center justify-between gap-4 py-5 sm:flex-row",
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
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function StudentDashboardScreen({
  labels = studentDashboardLabelsFr,
  fixture = studentDashboardFixtureFr,
  onDemoAction,
  headerEnd,
}: {
  labels?: StudentDashboardLabels;
  fixture?: StudentDashboardFixture;
  onDemoAction?: (message: string) => void;
  headerEnd?: ReactNode;
}) {
  const handleDemoClick = () => {
    onDemoAction?.(labels.panels.demoToast);
  };

  return (
    <DashboardStage>
      <StudentDashboardTopHeader labels={labels} headerEnd={headerEnd} />

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <StudentDashboardSidebar
          labels={labels}
          fixture={fixture}
          onDemoClick={handleDemoClick}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="landing-eyebrow rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-primary normal-case"
                >
                  {fixture.dateLabel}
                </Badge>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {labels.header.greetingPrefix}{" "}
                    <span className="gradient-text">{fixture.firstName}</span>
                    {labels.header.greetingSuffix}
                  </h1>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    {labels.header.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                  value={fixture.postsCount}
                  label={labels.header.statPosts}
                  tone="primary"
                />
                <StatCard
                  value={fixture.repliesCount}
                  label={labels.header.statReplies}
                  tone="accent"
                />
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
                      <DemoLinkButton
                        label={labels.panels.helpRequestsCta}
                        onClick={handleDemoClick}
                      />
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
                      <DemoLinkButton
                        label={labels.panels.subjectsCta}
                        onClick={handleDemoClick}
                      />
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
                footer={
                  <DemoLinkButton
                    label={labels.panels.resourcesCta}
                    onClick={handleDemoClick}
                  />
                }
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
          </main>
      </div>

      <StudentDashboardFooter labels={labels} onDemoClick={handleDemoClick} />
    </DashboardStage>
  );
}
