"use client";

import type { ReactNode } from "react";

import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeFooterRow,
  AppChromeHeader,
  AppChromeHeaderRow,
} from "@allaboard/ui/patterns/app-chrome-shell";
import { AppAbstractBackground } from "@allaboard/ui/patterns/app-abstract-background";
import { APP_STAGE_CLASS } from "@allaboard/ui/patterns/landing-layout";
import { AllAboardLogoMark } from "@allaboard/ui/components/allaboard-logo-mark";
import { cn } from "@allaboard/ui/lib/utils";

import { AppShellSidebar } from "@/components/features/app-shell-sidebar";
import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { shouldShowAppSidebar } from "@/lib/app-shell-sidebar";
import { Link, usePathname } from "@/i18n/navigation";

type AppShellLayoutProps = {
  children: ReactNode;
  brandName: string;
  year: number;
};

export function AppShellLayout({ children, brandName, year }: AppShellLayoutProps) {
  const pathname = usePathname();
  const showSidebar = shouldShowAppSidebar(pathname);

  return (
    <div className={cn(APP_STAGE_CLASS, "relative flex min-h-[100dvh] flex-col text-foreground")}>
      <AppAbstractBackground />
      <AppChromeHeader
        layout={showSidebar ? "surface" : "bar"}
        className={cn(
          "relative z-50 shrink-0",
          showSidebar &&
            "sticky top-0 z-20 grid grid-cols-[1fr_auto] md:grid-cols-[16rem_minmax(0,1fr)]",
        )}
      >
        {showSidebar ? (
          <>
            <div className="flex min-h-[4.25rem] items-center gap-3 px-3 sm:min-h-[4.75rem] sm:px-4">
              <Link
                href="/feed"
                className="-ml-1 shrink-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppChromeBrand brandName={brandName} />
              </Link>
            </div>
            <div className="flex min-h-[4.25rem] flex-wrap items-center justify-end gap-2 px-3 sm:min-h-[4.75rem] sm:gap-3 sm:px-4 md:px-6 lg:px-8">
              <LocaleSwitcher />
            </div>
          </>
        ) : (
          <AppChromeHeaderRow>
            <Link
              href="/feed"
              className="-ml-1 shrink-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AppChromeBrand brandName={brandName} />
            </Link>
            <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2 self-center sm:gap-4">
              <LocaleSwitcher />
            </div>
          </AppChromeHeaderRow>
        )}
      </AppChromeHeader>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {showSidebar ? <AppShellSidebar /> : null}
        <main
          id="main-content"
          className={cn(
            "relative z-10 min-w-0 flex-1",
            showSidebar ? "px-4 py-6 sm:px-6 lg:px-8" : "w-full px-4 py-6 sm:px-6 lg:px-8",
          )}
        >
          {showSidebar ? (
            children
          ) : (
            <div className="mx-auto w-full max-w-7xl pb-8">{children}</div>
          )}
        </main>
      </div>

      <AppChromeFooter className="relative z-10 shrink-0">
        <AppChromeFooterRow>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AllAboardLogoMark className="size-5" title={brandName} />
            <span className="gradient-text font-semibold">{brandName}</span>
            <span>© {year}</span>
          </div>
        </AppChromeFooterRow>
      </AppChromeFooter>
    </div>
  );
}
