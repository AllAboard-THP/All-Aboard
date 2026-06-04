"use client";

import type { ReactNode } from "react";

import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import { LandingConceptBackground } from "./landing-concept-background";
import {
  APP_CHROME_FOOTER_CLASS,
  APP_CHROME_FOOTER_SHELL_CLASS,
  LANDING_HEADER_OFFSET_CLASS,
} from "./landing-layout";
import { AppFooter, type LegacyLegalLinkKey } from "./legacy-ui";
import {
  LandingPublicHeader,
  type LandingPublicHeaderProps,
} from "./landing-public-header";

export type LandingPageShellProps = {
  children: ReactNode;
  labels?: LegacyLabels;
  className?: string;
  footerClassName?: string;
  onLegalLinkClick?: (key: LegacyLegalLinkKey) => void;
} & Pick<
  LandingPublicHeaderProps,
  "activeAction" | "onSignInClick" | "onSignUpClick" | "onLogoClick"
>;

export function LandingPageShell({
  children,
  labels = legacyLabelsFr,
  className,
  footerClassName,
  activeAction = "signIn",
  onSignInClick,
  onSignUpClick,
  onLogoClick,
  onLegalLinkClick,
}: LandingPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col overflow-x-hidden text-foreground",
        className,
      )}
    >
      <LandingConceptBackground className="fixed inset-0 z-0" />
      <LandingPublicHeader
        labels={labels}
        activeAction={activeAction}
        onSignInClick={onSignInClick}
        onSignUpClick={onSignUpClick}
        onLogoClick={onLogoClick}
      />
      <main
        className={cn(
          "relative z-10 flex flex-1 flex-col",
          LANDING_HEADER_OFFSET_CLASS,
        )}
      >
        {children}
      </main>
      <AppFooter
        labels={labels}
        className={cn(
          "relative z-10",
          APP_CHROME_FOOTER_SHELL_CLASS,
          APP_CHROME_FOOTER_CLASS,
          footerClassName,
        )}
        onLegalLinkClick={onLegalLinkClick}
      />
    </div>
  );
}
