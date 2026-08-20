"use client";

import type { ComponentType, MouseEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Compass,
  Library,
  MessageSquare,
  Plus,
  Reply,
  User,
  Zap,
} from "lucide-react";

import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import {
  studentDashboardFixtureFr,
  type DashboardActivityItem,
  type DashboardShortcut,
  type DashboardShortcutId,
  type DashboardTodoItem,
  type StudentDashboardFixture,
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
import {
  accentIconSurfaceStyle,
  accentSurfaceStyle,
  DASHBOARD_ACTIVITY_ACCENT,
  DASHBOARD_SHORTCUT_ACCENT,
  DASHBOARD_TODO_ACCENT,
} from "./dashboard-accent";

export type StudentDashboardVariant = "standalone" | "content";

export type DashboardLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

const SHORTCUT_ICONS: Record<DashboardShortcutId, LucideIcon> = {
  subjects: Compass,
  resources: Library,
  profile: User,
};

const PRIMARY_CTA_HREF = "/help/new";
const FEED_HREF = "/feed";

function PrimaryCtaButton({
  label,
  LinkComponent,
  onNavigate,
}: {
  label: string;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  const content = (
    <>
      <Plus className="size-4" aria-hidden />
      {label}
    </>
  );

  if (LinkComponent) {
    return (
      <Button asChild className="gap-2 rounded-full px-5">
        <LinkComponent href={PRIMARY_CTA_HREF} className="inline-flex shrink-0">
          {content}
        </LinkComponent>
      </Button>
    );
  }

  return (
    <Button className="gap-2 rounded-full px-5" onClick={() => onNavigate?.(PRIMARY_CTA_HREF)}>
      {content}
    </Button>
  );
}

function DashboardStage({ children }: { children: ReactNode }) {
  return (
    <div className={cn(APP_STAGE_CLASS, "dashboard-stage relative flex min-h-[100dvh] flex-col")}>
      <AppAbstractBackground />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">{children}</div>
    </div>
  );
}

function DashboardNavLink({
  href,
  className,
  children,
  LinkComponent,
  onNavigate,
  style,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
  style?: React.CSSProperties;
}) {
  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={className} style={style}>
        {children}
      </LinkComponent>
    );
  }

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => onNavigate?.(href)}
    >
      {children}
    </button>
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

function DashboardHeroCompact({
  labels,
  fixture,
  LinkComponent,
  onNavigate,
}: {
  labels: StudentDashboardLabels;
  fixture: StudentDashboardFixture;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  return (
    <header className="space-y-3">
      <span className="dashboard-date-badge">{fixture.dateLabel}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="landing-hero-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="landing-chrome-text">{labels.header.greetingPrefix}</span>{" "}
            <span className="gradient-text">
              {fixture.firstName}
              {labels.header.greetingSuffix}
            </span>
          </h1>
          <p className="max-w-xl text-muted-foreground">{labels.header.subtitle}</p>
          {fixture.summaryLine ? (
            <p className="text-sm text-muted-foreground/90">{fixture.summaryLine}</p>
          ) : null}
        </div>
        <PrimaryCtaButton
          label={labels.header.primaryCta}
          LinkComponent={LinkComponent}
          onNavigate={onNavigate}
        />
      </div>
    </header>
  );
}

function DashboardSectionHeader({
  id,
  title,
  icon,
  action,
}: {
  id: string;
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-1">
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function DashboardListPanel({ children }: { children: ReactNode }) {
  return <div className="dashboard-list-panel">{children}</div>;
}

function DashboardListShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        APP_GLASS_CARD_CLASS,
        "dashboard-glass-card dashboard-list-shell rounded-2xl p-5 shadow-none sm:p-6",
      )}
    >
      {children}
    </div>
  );
}

function TodoRow({
  item,
  LinkComponent,
  onNavigate,
}: {
  item: DashboardTodoItem;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  const accent = DASHBOARD_TODO_ACCENT[item.kind];

  return (
    <DashboardNavLink
      href={item.href}
      LinkComponent={LinkComponent}
      onNavigate={onNavigate}
      className="dashboard-list-row group flex w-full items-start gap-4 text-left"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={accentIconSurfaceStyle(accent)}
      >
        {item.kind === "message" ? (
          <MessageSquare className="size-4" aria-hidden />
        ) : item.kind === "resource" ? (
          <Library className="size-4" aria-hidden />
        ) : (
          <Zap className="size-4" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-sm font-medium leading-relaxed group-hover:text-foreground">
          {item.title}
        </span>
        {item.subtitle ? (
          <span className="block text-xs leading-relaxed text-muted-foreground">{item.subtitle}</span>
        ) : null}
      </span>
      {item.timeAgo ? (
        <span className="shrink-0 text-xs text-muted-foreground">{item.timeAgo}</span>
      ) : (
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      )}
    </DashboardNavLink>
  );
}

function DashboardInboxPanel({
  labels,
  todos,
  overflowCount = 0,
  LinkComponent,
  onNavigate,
}: {
  labels: StudentDashboardLabels;
  todos: DashboardTodoItem[];
  overflowCount?: number;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  return (
    <section className="space-y-3" aria-labelledby="dashboard-inbox-heading">
      <DashboardSectionHeader id="dashboard-inbox-heading" title={labels.inbox.title} />
      <DashboardListShell>
        <DashboardListPanel>
        {todos.length > 0 ? (
          <>
            {todos.map((item) => (
              <TodoRow
                key={item.id}
                item={item}
                LinkComponent={LinkComponent}
                onNavigate={onNavigate}
              />
            ))}
            {overflowCount > 0 ? (
              <p className="px-1 text-center text-xs text-muted-foreground">
                {labels.inbox.overflow(overflowCount)}
              </p>
            ) : null}
          </>
        ) : (
          <div className="dashboard-list-row py-8 text-center">
            <p className="text-sm text-muted-foreground">{labels.inbox.empty}</p>
            <DashboardNavLink
              href={FEED_HREF}
              LinkComponent={LinkComponent}
              onNavigate={onNavigate}
              className="dashboard-hover-link mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-primary"
            >
              {labels.inbox.emptyCta}
              <ArrowRight className="size-4" aria-hidden />
            </DashboardNavLink>
          </div>
        )}
        </DashboardListPanel>
      </DashboardListShell>
    </section>
  );
}

function ActivityRow({
  item,
  kindLabel,
  LinkComponent,
  onNavigate,
}: {
  item: DashboardActivityItem;
  kindLabel: string;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  const accent = DASHBOARD_ACTIVITY_ACCENT[item.kind];
  const ActivityIcon = item.kind === "reply" ? Reply : Library;

  return (
    <DashboardNavLink
      href={item.href}
      LinkComponent={LinkComponent}
      onNavigate={onNavigate}
      className="dashboard-list-row group flex w-full items-start gap-4 text-left"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={accentIconSurfaceStyle(accent)}
      >
        <ActivityIcon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={accentSurfaceStyle(accent)}
          >
            {kindLabel}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{item.timeAgo}</span>
        </div>
        <span className="block text-sm font-medium leading-relaxed group-hover:text-foreground">
          {item.title}
        </span>
        {item.excerpt ? (
          <span className="block text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {item.excerpt}
          </span>
        ) : null}
      </span>
    </DashboardNavLink>
  );
}

function DashboardActivitySection({
  labels,
  items,
  LinkComponent,
  onNavigate,
}: {
  labels: StudentDashboardLabels;
  items: DashboardActivityItem[];
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  return (
    <section className="space-y-3" aria-labelledby="dashboard-activity-heading">
      <DashboardSectionHeader
        id="dashboard-activity-heading"
        title={labels.activity.title}
        action={
          <DashboardNavLink
            href={FEED_HREF}
            LinkComponent={LinkComponent}
            onNavigate={onNavigate}
            className="dashboard-hover-link inline-flex shrink-0 items-center gap-1 text-sm text-primary"
          >
            {labels.activity.viewAll}
            <ArrowRight className="size-3.5" aria-hidden />
          </DashboardNavLink>
        }
      />
      <DashboardListShell>
        <DashboardListPanel>
        {items.length > 0 ? (
          items.map((item) => (
            <ActivityRow
              key={item.id}
              item={item}
              kindLabel={labels.activity.kinds[item.kind]}
              LinkComponent={LinkComponent}
              onNavigate={onNavigate}
            />
          ))
        ) : (
          <p className="dashboard-list-row py-8 text-center text-sm text-muted-foreground">
            {labels.activity.empty}
          </p>
        )}
        </DashboardListPanel>
      </DashboardListShell>
    </section>
  );
}

function ShortcutTile({
  shortcut,
  label,
  LinkComponent,
  onNavigate,
}: {
  shortcut: DashboardShortcut;
  label: string;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  const Icon = SHORTCUT_ICONS[shortcut.id];
  const accent = DASHBOARD_SHORTCUT_ACCENT[shortcut.id];

  return (
    <DashboardNavLink
      href={shortcut.href}
      LinkComponent={LinkComponent}
      onNavigate={onNavigate}
      className="dashboard-inner-card group flex flex-col items-center gap-2 px-4 py-5 text-center transition-colors hover:bg-white/8"
    >
      <span
        className="flex size-10 items-center justify-center rounded-xl"
        style={accentIconSurfaceStyle(accent)}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
    </DashboardNavLink>
  );
}

function DashboardShortcutGrid({
  labels,
  shortcuts,
  LinkComponent,
  onNavigate,
}: {
  labels: StudentDashboardLabels;
  shortcuts: DashboardShortcut[];
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {shortcuts.map((shortcut) => (
        <ShortcutTile
          key={shortcut.id}
          shortcut={shortcut}
          label={labels.shortcuts[shortcut.id]}
          LinkComponent={LinkComponent}
          onNavigate={onNavigate}
        />
      ))}
    </div>
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
  LinkComponent,
  onNavigate,
}: {
  labels: StudentDashboardLabels;
  fixture: StudentDashboardFixture;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  onNavigate?: (href: string) => void;
}) {
  const visibleTodos = fixture.todos.slice(0, 3);
  const overflowCount = Math.max(0, fixture.todos.length - visibleTodos.length);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl space-y-10">
      <DashboardHeroCompact
        labels={labels}
        fixture={fixture}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />

      <DashboardInboxPanel
        labels={labels}
        todos={visibleTodos}
        overflowCount={overflowCount}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />

      <DashboardActivitySection
        labels={labels}
        items={fixture.recentActivity}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />

      <DashboardShortcutGrid
        labels={labels}
        shortcuts={fixture.shortcuts}
        LinkComponent={LinkComponent}
        onNavigate={onNavigate}
      />
    </div>
  );
}

export function StudentDashboardScreen({
  labels = studentDashboardLabelsFr,
  fixture = studentDashboardFixtureFr,
  onDemoAction,
  onNavigate,
  LinkComponent,
  headerEnd,
  variant = "standalone",
}: {
  labels?: StudentDashboardLabels;
  fixture?: StudentDashboardFixture;
  onDemoAction?: (message: string) => void;
  onNavigate?: (href: string) => void;
  LinkComponent?: ComponentType<DashboardLinkProps>;
  headerEnd?: ReactNode;
  /** `content` = main panels only (sidebar/header from AppShell). */
  variant?: StudentDashboardVariant;
}) {
  const handleDemoClick = () => {
    onDemoAction?.("Demo — legal links");
  };

  const handleNavigate = (href: string) => {
    if (LinkComponent) {
      return;
    }
    onNavigate?.(href);
    onDemoAction?.(`Navigate → ${href}`);
  };

  const main = (
    <StudentDashboardMain
      labels={labels}
      fixture={fixture}
      LinkComponent={LinkComponent}
      onNavigate={handleNavigate}
    />
  );

  if (variant === "content") {
    return main;
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
          <AppChromeSidebar
            activeId="dashboard"
            messageCount={fixture.badgeCounts?.messages}
            feedCount={fixture.badgeCounts?.feed}
            dashboardCount={fixture.badgeCounts?.dashboard}
          />

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{main}</main>
        </div>

        <StudentDashboardFooter labels={labels} onDemoClick={handleDemoClick} />
      </AppSidebarProvider>
    </DashboardStage>
  );
}
