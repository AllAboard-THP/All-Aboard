"use client";

import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
import {
  APP_CHROME_HEADER_CLASS,
  APP_CHROME_HEADER_ROW_CLASS,
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
    <header className={cn(APP_CHROME_HEADER_CLASS, className)}>
      <div className={APP_CHROME_HEADER_ROW_CLASS}>
        <button
          type="button"
          className="-ml-1 shrink-0 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleLogo}
          aria-label={labels.brandName}
        >
          <BrandLogo labels={labels} className="items-start" />
        </button>

        <nav
          aria-label="Authentication"
          className="ml-auto flex shrink-0 items-center gap-2 self-center sm:gap-4"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              activeAction === "signIn" && "text-primary hover:text-primary",
            )}
            aria-current={activeAction === "signIn" ? "page" : undefined}
            onClick={handleSignIn}
          >
            {labels.auth.submit}
          </Button>
          <Button
            type="button"
            variant={activeAction === "signUp" ? "default" : "outline"}
            size="sm"
            className="min-w-[7.5rem] rounded-full px-4"
            aria-current={activeAction === "signUp" ? "page" : undefined}
            onClick={handleSignUp}
          >
            {labels.auth.signUp}
          </Button>
        </nav>
      </div>
    </header>
  );
}
