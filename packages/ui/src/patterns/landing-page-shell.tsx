"use client";

import type { ReactNode } from "react";

import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
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
    <div className={cn("flex min-h-[100dvh] flex-col bg-background text-foreground", className)}>
      <LandingPublicHeader
        labels={labels}
        activeAction={activeAction}
        onSignInClick={onSignInClick}
        onSignUpClick={onSignUpClick}
        onLogoClick={onLogoClick}
      />
      <main className="relative flex flex-1 flex-col pt-16">{children}</main>
      <AppFooter
        labels={labels}
        className={cn("mt-auto shrink-0", footerClassName)}
        onLegalLinkClick={onLegalLinkClick}
      />
    </div>
  );
}
