"use client";

import type { Decorator } from "@storybook/react";
import type { ReactNode } from "react";

import { AllAboardLogoMark } from "../components/allaboard-logo-mark";
import { cn } from "../lib/utils";
import { useStorybookLocale } from "../i18n/storybook-locale";
import { AppAbstractBackground } from "./app-abstract-background";
import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeFooterRow,
  AppChromeHeader,
} from "./app-chrome-shell";
import { AppChromeSidebar } from "./app-chrome-sidebar";
import { AppChromeUserMenu } from "./app-chrome-user-menu";
import { AppSidebarProvider } from "./app-sidebar-provider";
import type { AppSidebarNavId } from "./app-sidebar-nav";
import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
} from "./fixtures/student-dashboard";
import {
  APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
  APP_STAGE_CLASS,
} from "./landing-layout";
import {
  studentDashboardLabelsEn,
  studentDashboardLabelsFr,
} from "./student-dashboard-labels";

/**
 * Storybook shell mirroring `apps/web` `(app)/layout` — mesh, header, sidebar, footer.
 * Page stories render in the main slot only (same as `/profile` in prod).
 */
export function AppShellStoryFrame({
  children,
  activeId = "profile",
  mockPathname,
}: {
  children: ReactNode;
  activeId?: AppSidebarNavId;
  mockPathname?: string;
}) {
  const locale = useStorybookLocale();
  const labels =
    locale === "en" ? studentDashboardLabelsEn : studentDashboardLabelsFr;
  const fixture =
    locale === "en" ? studentDashboardFixtureEn : studentDashboardFixtureFr;

  return (
    <AppSidebarProvider>
      <div
        className={cn(
          APP_STAGE_CLASS,
          "relative flex min-h-[100dvh] flex-col text-foreground",
        )}
      >
        <AppAbstractBackground />
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
            <AppChromeUserMenu
              userName={fixture.fullName}
              userInitials={fixture.initials}
            />
          </div>
        </AppChromeHeader>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <AppChromeSidebar activeId={activeId} mockPathname={mockPathname} />
          <main
            id="main-content"
            className="relative z-10 min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"
          >
            {children}
          </main>
        </div>

        <AppChromeFooter className="relative z-10 shrink-0">
          <AppChromeFooterRow>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AllAboardLogoMark className="size-5" title={labels.brandName} />
              <span className="gradient-text font-semibold">
                {labels.brandName}
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </AppChromeFooterRow>
        </AppChromeFooter>
      </div>
    </AppSidebarProvider>
  );
}

export function withAppShellStoryFrame(options?: {
  activeId?: AppSidebarNavId;
  mockPathname?: string;
}): Decorator {
  return (Story) => (
    <AppShellStoryFrame
      activeId={options?.activeId}
      mockPathname={options?.mockPathname}
    >
      <Story />
    </AppShellStoryFrame>
  );
}
