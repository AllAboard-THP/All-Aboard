"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import {
  OAuthOnboardingForm,
  type OAuthOnboardingSubmitInput,
} from "./legacy-auth-patterns";
import { legacyDemoToast } from "./legacy-story-feedback";

type LandingOnboardingBodyProps = {
  labels: LegacyLabels;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit?: (input: OAuthOnboardingSubmitInput) => void | Promise<void>;
  onCguClick?: () => void;
};

/** OAuth onboarding body — centered card on app mesh (post Google sign-in). */
export function LandingOnboardingBody({
  labels,
  submitting = false,
  errorMessage,
  onSubmit,
  onCguClick,
}: LandingOnboardingBodyProps) {
  const handleSubmit =
    onSubmit ??
    ((input) => {
      legacyDemoToast(
        input.acceptCgu
          ? labels.auth.onboardingSubmit
          : labels.auth.acceptCgu,
      );
    });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-4 sm:py-6">
      <OAuthOnboardingForm
        labels={labels}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCguClick={onCguClick}
      />
    </div>
  );
}
