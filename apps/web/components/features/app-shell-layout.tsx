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
import {
  APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
  APP_STAGE_CLASS,
} from "@allaboard/ui/patterns/landing-layout";
import { AppSidebarMobileTrigger } from "@allaboard/ui/patterns/app-sidebar";
import { AppSidebarProvider, useAppSidebar } from "@allaboard/ui/patterns/app-sidebar-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@allaboard/ui/components/sheet";
import { AllAboardLogoMark } from "@allaboard/ui/components/allaboard-logo-mark";
import { cn } from "@allaboard/ui/lib/utils";
import { useLocale, useTranslations } from "next-intl";

import { AppShellSidebarContent } from "@/components/features/app-shell-sidebar";
import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { AppChromeUserMenu } from "@allaboard/ui/patterns/app-chrome-user-menu";
import { shouldShowAppSidebar } from "@/lib/app-shell-sidebar";
import { Link, usePathname } from "@/i18n/navigation";

type AppShellLayoutProps = {
  children: ReactNode;
  brandName: string;
  year: number;
};

function AppShellLayoutInner({ children, brandName, year }: AppShellLayoutProps) {
  const pathname = usePathname();
  const showSidebar = shouldShowAppSidebar(pathname);
  const { mobileOpen, setMobileOpen } = useAppSidebar();
  const t = useTranslations("studentDashboard.sidebar");
  const locale = useLocale();

  return (
    <div className={cn(APP_STAGE_CLASS, "relative flex min-h-[100dvh] flex-col text-foreground")}>
      <AppAbstractBackground />
      <AppChromeHeader
        layout={showSidebar ? "surface" : "bar"}
        className={cn(
          "relative z-50 shrink-0",
          showSidebar && cn("sticky top-0 z-20 grid grid-cols-[1fr_auto]", APP_CHROME_HEADER_SIDEBAR_GRID_CLASS),
        )}
      >
        {showSidebar ? (
          <>
            <div className="flex min-h-[4.25rem] shrink-0 items-center gap-2 overflow-visible px-3 sm:min-h-[4.75rem] sm:gap-3 sm:px-4">
              <AppSidebarMobileTrigger label={t("openMenu")} />
              <Link
                href="/feed"
                className="-ml-1 shrink-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <AppChromeBrand brandName={brandName} />
              </Link>
            </div>
            <div className="flex min-h-[4.25rem] flex-wrap items-center justify-end gap-2 px-3 sm:min-h-[4.75rem] sm:gap-3 sm:px-4 md:px-6 lg:px-8">
              <LocaleSwitcher />
              <AppChromeUserMenu locale={locale === "en" ? "en" : "fr"} />
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
        {showSidebar ? <AppShellSidebarContent /> : null}
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

      {showSidebar ? (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[min(100%,20rem)] border-white/10 bg-background/95 p-0 backdrop-blur-xl">
            <SheetHeader className="border-b border-white/10 px-4 py-3 text-left">
              <SheetTitle className="text-base">{t("openMenu")}</SheetTitle>
            </SheetHeader>
            <AppShellSidebarContent forceExpanded hideToggle className="!flex h-[calc(100dvh-4rem)] border-0" />
          </SheetContent>
        </Sheet>
      ) : null}

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

export function AppShellLayout(props: AppShellLayoutProps) {
  return (
    <AppSidebarProvider>
      <AppShellLayoutInner {...props} />
    </AppSidebarProvider>
  );
}
