"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import { DedicatedRegisterForm } from "./register-form";
import { legacyDemoToast } from "./legacy-story-feedback";

type LandingRegisterBodyProps = {
  labels: LegacyLabels;
  submitting?: boolean;
  errorMessage?: string | null;
  onSubmit?: Parameters<typeof DedicatedRegisterForm>[0]["onSubmit"];
  onGoogleSignInClick?: () => void;
  onCguClick?: () => void;
};

/** Dedicated register form body — centered card on app mesh. */
export function LandingRegisterBody({
  labels,
  submitting = false,
  errorMessage,
  onSubmit,
  onGoogleSignInClick,
  onCguClick,
}: LandingRegisterBodyProps) {
  const handleSubmit =
    onSubmit ??
    ((input) => {
      legacyDemoToast(
        input.acceptCgu
          ? labels.auth.registerSubmit
          : labels.auth.acceptCgu,
      );
    });
  const handleGoogleSignIn =
    onGoogleSignInClick ??
    (() => legacyDemoToast(labels.auth.continueWithGoogle));

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-4 sm:py-6">
      <DedicatedRegisterForm
        labels={labels}
        variant="landing"
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onGoogleSignInClick={handleGoogleSignIn}
        onCguClick={onCguClick}
      />
    </div>
  );
}
