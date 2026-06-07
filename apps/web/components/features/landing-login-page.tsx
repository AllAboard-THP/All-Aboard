"use client";

import { LandingLoginScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { useRouter } from "@/i18n/navigation";

/** Landing login — wired to apps/web auth routes. */
export function LandingLoginPage() {
  const router = useRouter();

  return (
    <LandingLoginScreen
      onForgotPasswordClick={() => router.push("/forgot-password")}
      onSignUpClick={() => router.push("/register")}
    />
  );
}
