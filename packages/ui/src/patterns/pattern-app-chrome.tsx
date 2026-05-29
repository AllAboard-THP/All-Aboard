"use client";

import type { Decorator } from "@storybook/react";
import type { ReactNode } from "react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import {
  MobileBottomNav,
  type MobileNavLink,
} from "./legacy-mobile-patterns";
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
}: {
  children: ReactNode;
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
    <div className="flex min-h-[100dvh] flex-col">
      {showNav ? (
        <AppNavBar
          activeLink={activeLink}
          messageCount={messageCount}
          userMenuOpen={userMenuOpen}
          isAdmin={isAdmin}
          isMentor={isMentor}
          userInitials={userInitials}
          labels={labels}
        />
      ) : null}
      <main
        className={
          showNav
            ? cnMainClass(mobileChrome)
            : "flex-1"
        }
      >
        {children}
      </main>
      {showFooter ? <AppFooter labels={labels} className={mobileChrome ? "pb-20 md:pb-0" : undefined} /> : null}
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

function cnMainClass(mobileChrome: boolean) {
  const base =
    "mx-auto w-full max-w-7xl flex-1 px-4 pt-24 sm:px-6 lg:px-8";
  return mobileChrome
    ? `${base} pb-24 md:pb-8`
    : `${base} pb-8`;
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
