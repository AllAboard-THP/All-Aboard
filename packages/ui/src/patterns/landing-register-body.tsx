"use client";

import type { LegacyLabels } from "../i18n/legacy-labels";
import { RegisterForm } from "./legacy-auth-patterns";
import { LandingAuthHeroLayout } from "./landing-auth-hero-layout";

type LandingRegisterBodyProps = {
  labels: LegacyLabels;
};

/** Landing body — same hero grid as login, register card on the right. */
export function LandingRegisterBody({ labels }: LandingRegisterBodyProps) {
  return (
    <LandingAuthHeroLayout labels={labels}>
      <RegisterForm labels={labels} variant="landing" />
    </LandingAuthHeroLayout>
  );
}
