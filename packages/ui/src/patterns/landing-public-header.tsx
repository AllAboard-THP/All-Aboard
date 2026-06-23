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
  LANDING_HEADER_GHOST_BUTTON_CLASS,
  LANDING_HEADER_OUTLINE_BUTTON_CLASS,
  LANDING_HEADER_SUBMIT_BUTTON_CLASS,
} from "./landing-layout";
import { BrandLogo } from "./legacy-ui";
import { legacyDemoToast } from "./legacy-story-feedback";

export type LandingPublicHeaderProps = {
  labels?: LegacyLabels;
  className?: string;
  /** Highlights the sign-in affordance on the login landing screen. */
  activeAction?: "signIn" | "signUp";
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  onLogoClick?: () => void;
};

export function LandingPublicHeader({
  labels = legacyLabelsFr,
  className,
  activeAction = "signIn",
  onSignInClick,
  onSignUpClick,
  onLogoClick,
}: LandingPublicHeaderProps) {
  const handleSignIn = onSignInClick ?? (() => legacyDemoToast(labels.auth.submit));
  const handleSignUp = onSignUpClick ?? (() => legacyDemoToast(labels.auth.signUp));
  const handleLogo = onLogoClick ?? (() => legacyDemoToast(labels.brandName));

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
          className="ml-auto flex shrink-0 items-center gap-2 self-center sm:gap-4"
        >
          <Button
            type="button"
            variant="landingHeaderGhost"
            size="sm"
            className={cn(
              LANDING_HEADER_GHOST_BUTTON_CLASS,
              activeAction === "signIn" && "text-white",
            )}
            aria-current={activeAction === "signIn" ? "page" : undefined}
            onClick={handleSignIn}
          >
            {labels.auth.submit}
          </Button>
          <Button
            type="button"
            variant={activeAction === "signUp" ? "landingSubmit" : "landingHeaderOutline"}
            size="sm"
            className={cn(
              activeAction === "signUp"
                ? LANDING_HEADER_SUBMIT_BUTTON_CLASS
                : LANDING_HEADER_OUTLINE_BUTTON_CLASS,
            )}
            aria-current={activeAction === "signUp" ? "page" : undefined}
            onClick={handleSignUp}
          >
            {labels.auth.signUp}
          </Button>
        </nav>
      </AppChromeHeaderRow>
    </AppChromeHeader>
  );
}
