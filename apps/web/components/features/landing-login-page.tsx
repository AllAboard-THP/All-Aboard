"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@allaboard/ui/components/alert";
import { LandingLoginScreen } from "@allaboard/ui/patterns/screens/legacy-screens";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";

import { useRouter } from "@/i18n/navigation";

function LandingLoginOAuthFeedback() {
  const labels = useLegacyLabels();
  const [oauthError, setOauthError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth_error") === "oauth_failed") {
      setOauthError(true);
      params.delete("auth_error");
      const next = params.toString();
      const url = next
        ? `${window.location.pathname}?${next}`
        : window.location.pathname;
      window.history.replaceState({}, "", url);
    }
  }, []);

  if (!oauthError) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-lg px-4">
      <Alert variant="destructive">
        <AlertDescription>{labels.auth.oauthError}</AlertDescription>
      </Alert>
    </div>
  );
}

/** Landing login — wired to apps/web auth routes; locale via root `LocaleBridge`. */
export function LandingLoginPage() {
  const router = useRouter();

  return (
    <>
      <LandingLoginOAuthFeedback />
      <LandingLoginScreen
        onForgotPasswordClick={() => router.push("/forgot-password")}
        onSignUpClick={() => router.push("/register")}
        onGoogleSignInClick={() => {
          window.location.href = "/api/auth/google";
        }}
      />
    </>
  );
}
