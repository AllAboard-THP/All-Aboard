"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription } from "@allaboard/ui/components/alert";
import { LandingLoginScreen } from "@allaboard/ui/patterns/screens/legacy-screens";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";

import { useRouter } from "@/i18n/navigation";
import { mapApiError } from "@/lib/map-api-error";
import { DEFAULT_EMAIL_POST_LOGIN_PATH } from "@/lib/app-routes";
import { normalizeLoginEmail } from "@/lib/normalize-login-email";
import { useLandingShellActions } from "@/lib/use-landing-shell-actions";

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
  const tErrors = useTranslations("errors");
  const shellActions = useLandingShellActions();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit({ email, password }: { email: string; password: string }) {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: normalizeLoginEmail(email),
          password,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        const key = mapApiError({ status: res.status, body });
        setErrorMessage(tErrors(key));
        setSubmitting(false);
        return;
      }

      router.replace(DEFAULT_EMAIL_POST_LOGIN_PATH);
    } catch {
      setErrorMessage(tErrors("unknown"));
      setSubmitting(false);
    }
  }

  return (
    <>
      <LandingLoginOAuthFeedback />
      <LandingLoginScreen
        {...shellActions}
        onForgotPasswordClick={() => router.push("/forgot-password")}
        onGoogleSignInClick={() => {
          window.location.href = "/api/auth/google";
        }}
        onSubmit={handleSubmit}
        submitting={submitting}
        errorMessage={errorMessage}
      />
    </>
  );
}
