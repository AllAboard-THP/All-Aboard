"use client";

import type { Decorator } from "@storybook/react";
import type { ReactNode } from "react";

import { cn } from "@allaboard/ui/lib/utils";
import { useLegacyLabels } from "../i18n/storybook-locale";
import {
  MobileBottomNav,
  type MobileNavLink,
} from "./legacy-mobile-patterns";
import { AppAbstractBackground } from "./app-abstract-background";
import { AppChromeSidebar } from "./app-chrome-sidebar";
import {
  AppChromeBrand,
  AppChromeFooter,
  AppChromeHeader,
} from "./app-chrome-shell";
import {
  APP_CHROME_FEED_INNER_CLASS,
  APP_CHROME_FOOTER_CLASS,
  APP_CHROME_FOOTER_SHELL_CLASS,
  APP_CHROME_HEADER_SIDEBAR_GRID_CLASS,
  APP_CHROME_MAIN_INNER_CLASS,
  APP_STAGE_CLASS,
} from "./landing-layout";
import {
  resolveSidebarActiveId,
  type AppSidebarNavId,
} from "./app-sidebar-nav";
import { AppSidebarProvider } from "./app-sidebar-provider";
import {
  AppFooter,
  AppNavBar,
  UserMenu,
  type LegacyNavLink,
} from "./legacy-ui";

function resolveMobileNavLink(activeLink: LegacyNavLink): MobileNavLink {
  if (activeLink === "explore") return "explore";
  if (activeLink === "messages") return "messages";
  return "feed";
}

export function AppChrome({
  children,
  activeLink = "feed",
  showNav = true,
  showSidebar,
  sidebarActiveId,
  showFooter = true,
  messageCount = 0,
  userMenuOpen = false,
  isAdmin = false,
  isMentor = false,
  mobileChrome = false,
  showMentorDot = false,
  userInitials = "AA",
  mainInnerLayout = "contained",
}: {
  children: ReactNode;
  mainInnerLayout?: "contained" | "feed";
  activeLink?: LegacyNavLink;
  /** @deprecated Top nav pills — sidebar replaces main nav when visible. */
  showNav?: boolean;
  /** Defaults to `showNav` — false for register / legal full-width screens. */
  showSidebar?: boolean;
  sidebarActiveId?: AppSidebarNavId;
  showFooter?: boolean;
  messageCount?: number;
  userMenuOpen?: boolean;
  isAdmin?: boolean;
  isMentor?: boolean;
  mobileChrome?: boolean;
  showMentorDot?: boolean;
  userInitials?: string;
}) {
  const labels = useLegacyLabels();
  const sidebarVisible = (showSidebar ?? showNav) && !mobileChrome;
  const resolvedActiveId = resolveSidebarActiveId(sidebarActiveId, activeLink);

  return (
    <AppSidebarProvider>
      <div className={cn(APP_STAGE_CLASS, "relative flex min-h-[100dvh] flex-col text-foreground")}>
        <AppAbstractBackground />

        {sidebarVisible ? (
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
            {showNav ? (
              <UserMenu
                userName={isAdmin ? "Admin AllAboard" : "Inès Martin"}
                userEmail="demo@allaboard.app"
                userInitials={userInitials}
                isAdmin={isAdmin}
                isMentor={isMentor}
                defaultOpen={userMenuOpen}
                labels={labels}
              />
            ) : null}
          </div>
        </AppChromeHeader>
      ) : (
        <AppNavBar
          activeLink={activeLink}
          messageCount={messageCount}
          userMenuOpen={userMenuOpen}
          isAdmin={isAdmin}
          isMentor={isMentor}
          userInitials={userInitials}
          labels={labels}
          showMainNav={showNav}
          showUserMenu={showNav}
          className="relative z-50"
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {sidebarVisible ? (
          <AppChromeSidebar
            activeId={resolvedActiveId}
            messageCount={messageCount}
            showMentorDot={showMentorDot}
            isMentor={isMentor || isAdmin}
            isAdmin={isAdmin}
          />
        ) : null}
        <main
          id="main-content"
          className={cn(
            "relative z-10 min-w-0 flex-1",
            sidebarVisible
              ? cn("px-4 py-6 sm:px-6 lg:px-8", mobileChrome && "pb-24 md:pb-8")
              : cn(
                  "w-full pb-8 pt-[6rem] sm:pt-24",
                ),
          )}
        >
          {sidebarVisible ? (
            children
          ) : (
            <div
              className={
                mainInnerLayout === "feed"
                  ? APP_CHROME_FEED_INNER_CLASS
                  : APP_CHROME_MAIN_INNER_CLASS
              }
            >
              {children}
            </div>
          )}
        </main>
      </div>

      {showFooter ? (
        sidebarVisible ? (
          <AppChromeFooter className={cn("relative z-10 shrink-0", mobileChrome && "pb-20 md:pb-0")}>
            <AppFooter labels={labels} edgeToEdge />
          </AppChromeFooter>
        ) : (
          <AppFooter
            labels={labels}
            className={cn(
              "relative z-10",
              APP_CHROME_FOOTER_SHELL_CLASS,
              APP_CHROME_FOOTER_CLASS,
              mobileChrome ? "pb-20 md:pb-0" : undefined,
            )}
          />
        )
      ) : null}

      {mobileChrome ? (
        <MobileBottomNav
          activeLink={resolveMobileNavLink(activeLink)}
          messageCount={messageCount}
          userInitials={userInitials}
          showMentorDot={showMentorDot}
          labels={labels}
        />
      ) : null}
      </div>
    </AppSidebarProvider>
  );
}

export function withAppChrome(
  activeLink: LegacyNavLink = "feed",
  options?: {
    showNav?: boolean;
    showFooter?: boolean;
    sidebarActiveId?: AppSidebarNavId;
  },
): Decorator {
  return (Story) => (
    <AppChrome
      activeLink={activeLink}
      showNav={options?.showNav ?? true}
      showFooter={options?.showFooter ?? true}
      sidebarActiveId={options?.sidebarActiveId}
    >
      <Story />
    </AppChrome>
  );
}

export function withMobileChrome(
  activeLink: LegacyNavLink = "feed",
  options?: {
    messageCount?: number;
    showMentorDot?: boolean;
    showFooter?: boolean;
    sidebarActiveId?: AppSidebarNavId;
  },
): Decorator {
  return (Story) => (
    <AppChrome
      activeLink={activeLink}
      mobileChrome
      messageCount={options?.messageCount ?? 0}
      showMentorDot={options?.showMentorDot}
      showFooter={options?.showFooter ?? true}
      sidebarActiveId={options?.sidebarActiveId}
    >
      <Story />
    </AppChrome>
  );
}

export {
  mobileStoryParameters,
  screenStoryParameters,
} from "./pattern-story-frame";
