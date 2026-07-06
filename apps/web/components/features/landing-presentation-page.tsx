"use client";

import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import { LandingPresentationBody } from "@allaboard/ui/patterns/landing-presentation-body";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";

import { useRouter } from "@/i18n/navigation";

/** Public marketing landing — presentation only; auth via header → `/login`. */
export function LandingPresentationPage() {
  const router = useRouter();
  const labels = useLegacyLabels();

  return (
    <LandingPageShell
      labels={labels}
      onSignInClick={() => router.push("/login")}
      onSignUpClick={() => router.push("/register")}
      onLogoClick={() => router.push("/")}
    >
      <LandingPresentationBody labels={labels} />
    </LandingPageShell>
  );
}
