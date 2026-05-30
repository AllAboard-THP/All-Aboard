"use client";

import { Button } from "../components/button";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";
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
    <header
      className={cn(
        "glass fixed top-0 z-50 w-full border-b border-white/10",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={handleLogo}
          aria-label={labels.brandName}
        >
          <BrandLogo labels={labels} />
        </button>

        <nav
          aria-label="Authentication"
          className="flex items-center gap-2 sm:gap-3"
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
            className="rounded-xl"
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
