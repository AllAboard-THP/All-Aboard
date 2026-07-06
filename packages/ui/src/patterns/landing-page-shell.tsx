"use client";

import type { ReactNode } from "react";

import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import { AppAbstractBackground } from "./app-abstract-background";
import { LandingConceptBackground } from "./landing-concept-background";
import {
  APP_CHROME_FOOTER_SHELL_CLASS,
  APP_STAGE_CLASS,
  LANDING_HEADER_OFFSET_CLASS,
  LANDING_SHELL_FOOTER_CLASS,
} from "./landing-layout";
import { AppFooter, type LegacyLegalLinkKey } from "./legacy-ui";
import {
  LandingPublicHeader,
  type LandingPublicHeaderProps,
} from "./landing-public-header";

export type LandingPageShellBackground = "landing" | "app";

export type LandingPageShellProps = {
  children: ReactNode;
  labels?: LegacyLabels;
  /** `landing` = hero photo; `app` = light abstract bicolor (auth aux pages). */
  background?: LandingPageShellBackground;
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
  background = "landing",
  className,
  footerClassName,
  activeAction,
  onSignInClick,
  onSignUpClick,
  onLogoClick,
  onLegalLinkClick,
}: LandingPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] flex-col overflow-x-hidden text-foreground",
        background === "app" ? APP_STAGE_CLASS : undefined,
        className,
      )}
    >
      {background === "landing" ? (
        <LandingConceptBackground />
      ) : (
        <AppAbstractBackground />
      )}
      <LandingPublicHeader
        labels={labels}
        activeAction={activeAction}
        onSignInClick={onSignInClick}
        onSignUpClick={onSignUpClick}
        onLogoClick={onLogoClick}
      />
      <main
        id="main-content"
        className="relative z-10 flex min-h-0 flex-1 flex-col"
      >
        <div
          className={cn(
            "relative z-10 flex min-h-0 flex-1 flex-col",
            LANDING_HEADER_OFFSET_CLASS,
          )}
        >
          {children}
        </div>
      </main>
      <AppFooter
        labels={labels}
        className={cn(
          "relative z-10",
          APP_CHROME_FOOTER_SHELL_CLASS,
          LANDING_SHELL_FOOTER_CLASS,
          footerClassName,
        )}
        onLegalLinkClick={onLegalLinkClick}
      />
    </div>
  );
}
