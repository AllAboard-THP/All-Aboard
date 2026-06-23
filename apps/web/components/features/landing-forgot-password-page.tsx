"use client";

import { ForgotPasswordScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { useLandingShellActions } from "@/lib/use-landing-shell-actions";

/** Forgot-password landing — shell chrome wired to apps/web routes. */
export function LandingForgotPasswordPage() {
  const shellActions = useLandingShellActions();

  return <ForgotPasswordScreen {...shellActions} />;
}
