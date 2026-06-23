"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import { ForgotPasswordForm } from "./legacy-auth-patterns";

type LandingForgotPasswordBodyProps = {
  labels: LegacyLabels;
};

/** Dedicated forgot-password body — centered card on app mesh (matches register). */
export function LandingForgotPasswordBody({
  labels,
}: LandingForgotPasswordBodyProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-4 sm:py-6">
      <ForgotPasswordForm labels={labels} variant="landing" />
    </div>
  );
}
