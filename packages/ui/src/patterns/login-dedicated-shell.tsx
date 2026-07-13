"use client";

import type { ReactNode } from "react";

import type { LegacyLabels } from "../i18n/legacy-labels";
import { cn } from "../lib/utils";
import { LOGIN_DEDICATED_MAIN_CLASS } from "./landing-layout";
import {
  LandingPageShell,
  type LandingPageShellProps,
} from "./landing-page-shell";

export type LoginDedicatedShellProps = {
  children: ReactNode;
  labels?: LegacyLabels;
  className?: string;
} & Pick<
  LandingPageShellProps,
  | "activeAction"
  | "onSignInClick"
  | "onSignUpClick"
  | "onLogoClick"
  | "onLegalLinkClick"
>;

/**
 * Dedicated login shell — landing hero photo, canonical header/footer chrome,
 * auth card centered in the main stage.
 */
export function LoginDedicatedShell({
  children,
  labels,
  className,
  activeAction = "signIn",
  onSignInClick,
  onSignUpClick,
  onLogoClick,
  onLegalLinkClick,
}: LoginDedicatedShellProps) {
  return (
    <LandingPageShell
      labels={labels}
      background="landing"
      activeAction={activeAction}
      className={className}
      onSignInClick={onSignInClick}
      onSignUpClick={onSignUpClick}
      onLogoClick={onLogoClick}
      onLegalLinkClick={onLegalLinkClick}
    >
      <div className={cn(LOGIN_DEDICATED_MAIN_CLASS)}>{children}</div>
    </LandingPageShell>
  );
}
