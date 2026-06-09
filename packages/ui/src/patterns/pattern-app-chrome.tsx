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
import {
  APP_CHROME_FOOTER_CLASS,
  APP_CHROME_FOOTER_SHELL_CLASS,
  APP_CHROME_FEED_INNER_CLASS,
  APP_CHROME_FEED_MAIN_CLASS,
  APP_CHROME_MAIN_CLASS,
  APP_CHROME_MAIN_INNER_CLASS,
  APP_STAGE_CLASS,
} from "./landing-layout";
import {
  AppFooter,
  AppNavBar,
  type LegacyNavLink,
} from "./legacy-ui";
import { patternStoryParameters } from "./pattern-story-frame";

function resolveMobileNavLink(activeLink: LegacyNavLink): MobileNavLink {
  if (activeLink === "explore") return "explore";
  if (activeLink === "messages") return "messages";
  return "feed";
}

export function AppChrome({
  children,
  activeLink = "feed",
  showNav = true,
  showFooter = true,
  messageCount = 0,
  userMenuOpen = false,
  isAdmin = true,
  isMentor = false,
  mobileChrome = false,
  showMentorDot = false,
  userInitials = "AA",
  mainInnerLayout = "contained",
}: {
  children: ReactNode;
  /** `feed` uses full-width inner track for tri-band background alignment. */
  mainInnerLayout?: "contained" | "feed";
  activeLink?: LegacyNavLink;
  showNav?: boolean;
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

  return (
    <div className={cn(APP_STAGE_CLASS, "relative flex min-h-[100dvh] flex-col")}>
      <AppAbstractBackground />
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
      />
      <main className={cnMainClass(mobileChrome, mainInnerLayout)}>
        <div
          className={
            mainInnerLayout === "feed"
              ? APP_CHROME_FEED_INNER_CLASS
              : APP_CHROME_MAIN_INNER_CLASS
          }
        >
          {children}
        </div>
      </main>
      {showFooter ? (
        <AppFooter
          labels={labels}
          className={cn(
            "relative z-10",
            APP_CHROME_FOOTER_SHELL_CLASS,
            APP_CHROME_FOOTER_CLASS,
            mobileChrome ? "pb-20 md:pb-0" : undefined,
          )}
        />
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
  );
}

function cnMainClass(
  mobileChrome: boolean,
  mainInnerLayout: "contained" | "feed",
) {
  const mainClass =
    mainInnerLayout === "feed" ? APP_CHROME_FEED_MAIN_CLASS : APP_CHROME_MAIN_CLASS;

  return mobileChrome
    ? cn(mainClass, "relative z-10 pb-24 md:pb-8")
    : cn(mainClass, "relative z-10 pb-8");
}

function AppChromeStoryWrapper({
  activeLink,
  showNav,
  showFooter,
  mobileChrome,
  children,
}: {
  activeLink: LegacyNavLink;
  showNav?: boolean;
  showFooter?: boolean;
  mobileChrome?: boolean;
  children: ReactNode;
}) {
  return (
    <AppChrome
      activeLink={activeLink}
      showNav={showNav}
      showFooter={showFooter}
      mobileChrome={mobileChrome}
    >
      {children}
    </AppChrome>
  );
}

export function withAppChrome(
  activeLink: LegacyNavLink = "feed",
  options?: { showNav?: boolean; showFooter?: boolean },
): Decorator {
  return (Story) => (
    <AppChromeStoryWrapper
      activeLink={activeLink}
      showNav={options?.showNav ?? true}
      showFooter={options?.showFooter ?? true}
    >
      <Story />
    </AppChromeStoryWrapper>
  );
}

export function withMobileChrome(
  activeLink: LegacyNavLink = "feed",
  options?: {
    messageCount?: number;
    showMentorDot?: boolean;
    showFooter?: boolean;
  },
): Decorator {
  return (Story) => (
    <AppChrome
      activeLink={activeLink}
      mobileChrome
      messageCount={options?.messageCount ?? 0}
      showMentorDot={options?.showMentorDot}
      showFooter={options?.showFooter ?? true}
    >
      <Story />
    </AppChrome>
  );
}

export const mobileStoryParameters = {
  ...patternStoryParameters,
  layout: "fullscreen" as const,
  viewport: {
    defaultViewport: "mobile1",
  },
};

export const screenStoryParameters = {
  ...patternStoryParameters,
  layout: "fullscreen" as const,
};
