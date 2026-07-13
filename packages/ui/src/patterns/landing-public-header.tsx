"use client";

import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  AppChromeHeader,
  AppChromeHeaderRow,
} from "./app-chrome-shell";
import {
  LANDING_HEADER_AUTH_MENU_TRIGGER_CLASS,
  LANDING_HEADER_SUBMIT_BUTTON_CLASS,
} from "./landing-layout";
import { BrandLogo } from "./legacy-ui";
import { legacyDemoToast } from "./legacy-story-feedback";

export type LandingPublicHeaderProps = {
  labels?: LegacyLabels;
  className?: string;
  /** Highlights the matching header action; omit for the marketing home (neither highlighted). */
  activeAction?: "signIn" | "signUp" | null;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onLogoClick?: () => void;
};

export function LandingPublicHeader({
  labels = legacyLabelsFr,
  className,
  activeAction,
  onSignInClick,
  onSignUpClick,
  onLogoClick,
}: LandingPublicHeaderProps) {
  const handleSignIn = onSignInClick ?? (() => legacyDemoToast(labels.auth.submit));
  const handleSignUp = onSignUpClick ?? (() => legacyDemoToast(labels.auth.signUp));
  const handleLogo = onLogoClick ?? (() => legacyDemoToast(labels.brandName));

  const buttonLabel =
    activeAction === "signUp"
      ? labels.auth.signUp
      : activeAction === "signIn"
        ? labels.auth.submit
        : labels.auth.headerAuthMenu;

  const handleAuthClick =
    activeAction === "signUp" ? handleSignUp : handleSignIn;

  return (
    <AppChromeHeader layout="bar" className={className}>
      <AppChromeHeaderRow>
        <button
          type="button"
          className="-ml-1 shrink-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleLogo}
          aria-label={labels.brandName}
        >
          <BrandLogo labels={labels} className="min-w-0 shrink-0" />
        </button>

        <nav
          aria-label="Authentication"
          className="ml-auto flex shrink-0 items-center self-center"
        >
          <Button
            type="button"
            variant={activeAction != null ? "landingSubmit" : "landingHeaderOutline"}
            size="sm"
            className={cn(
              activeAction != null
                ? LANDING_HEADER_SUBMIT_BUTTON_CLASS
                : LANDING_HEADER_AUTH_MENU_TRIGGER_CLASS,
            )}
            aria-current={activeAction != null ? "page" : undefined}
            onClick={handleAuthClick}
          >
            {buttonLabel}
          </Button>
        </nav>
      </AppChromeHeaderRow>
    </AppChromeHeader>
  );
}
