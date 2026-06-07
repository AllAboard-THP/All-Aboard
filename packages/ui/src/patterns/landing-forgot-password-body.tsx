"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import { ForgotPasswordForm } from "./legacy-auth-patterns";
import { LandingAuthHeroLayout } from "./landing-auth-hero-layout";

type LandingForgotPasswordBodyProps = {
  labels: LegacyLabels;
};

/** Landing body — same hero grid as login, forgot-password card on the right. */
export function LandingForgotPasswordBody({
  labels,
}: LandingForgotPasswordBodyProps) {
  return (
    <LandingAuthHeroLayout labels={labels}>
      <ForgotPasswordForm labels={labels} variant="landing" />
    </LandingAuthHeroLayout>
  );
}
