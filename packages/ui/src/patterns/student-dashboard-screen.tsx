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
  studentDashboardLabelsFr,
  type StudentDashboardLabels,
} from "./student-dashboard-labels";

type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-pink-500/20 text-sm font-bold text-primary shadow-[0_0_24px_hsl(239_84%_67%_/_0.25)] ring-1 ring-white/15",
        className,
      )}
      aria-hidden
    >
      AA
    </div>
  );
}

function DashboardStage({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-stage flex min-h-[100dvh] flex-col">
      <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="dashboard-stage-glow dashboard-stage-glow--indigo -left-24 top-0 size-72"
        aria-hidden
      />
      <div
        className="dashboard-stage-glow dashboard-stage-glow--pink right-0 top-1/3 size-64"
        aria-hidden
      />
      <div
        className="dashboard-stage-glow dashboard-stage-glow--indigo bottom-0 left-1/3 size-80 opacity-70"
        aria-hidden
      />
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
  tone?: "primary" | "accent" | "emerald";
}) {
  const toneClass = {
    primary: "text-primary",
    accent: "text-accent",
    emerald: "text-emerald-400",
  }[tone];

  return (
    <div className="dashboard-stat-card min-w-[7.5rem]">
      <p className={cn("text-2xl font-bold sm:text-3xl", toneClass)}>{value}</p>
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
    <aside className="dashboard-glass-surface flex w-full shrink-0 flex-col rounded-none border-y-0 border-l-0 md:w-64">
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
    <Card className="dashboard-glass-card gap-0 rounded-2xl py-0 shadow-none">
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

function StudentDashboardTopHeader({
  labels,
  headerEnd,
}: {
  labels: StudentDashboardLabels;
  headerEnd?: ReactNode;
}) {
  return (
    <header className="landing-chrome sticky top-0 z-20 shrink-0 border-b">
      <div className="flex min-h-[4.25rem] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="size-10" />
          <div className="min-w-0">
            <p className="gradient-text text-lg font-bold">{labels.brandName}</p>
            <p className="truncate text-xs text-violet-200/70">{labels.chrome.demoBadge}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {headerEnd}
          <Badge
            variant="outline"
            className="hidden rounded-full border-primary/30 bg-primary/10 text-primary sm:inline-flex"
          >
            {labels.chrome.demoBadge}
          </Badge>
        </div>
      </div>
    </header>
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
      <div className="flex flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
          <BrandMark className="size-7 text-[10px]" />
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

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="animate-fade-in mx-auto max-w-6xl space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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

                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <StatCard
                    value={fixture.postsCount}
                    label={labels.header.statPosts}
                    tone="primary"
                  />
                  <StatCard
                    value={fixture.repliesCount}
                    label={labels.header.statReplies}
                    tone="emerald"
                  />
                  <StatCard
                    value={fixture.communityRating}
                    label={labels.header.statRating}
                    tone="accent"
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
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
                      <div className="space-y-3">
                        {fixture.resources.map((item) => (
                          <ResourcePreviewCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState message={labels.panels.resourcesEmpty} />
                    )}
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
            </div>
          </main>
        </div>
      </div>

      <StudentDashboardFooter labels={labels} onDemoClick={handleDemoClick} />
    </DashboardStage>
  );
}
