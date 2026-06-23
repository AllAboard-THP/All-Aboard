"use client";

import { useEffect, useState } from "react";
import type { AuthMeResponse } from "@allaboard/types";

import {
  OAuthOnboardingForm,
  type OAuthOnboardingSubmitInput,
} from "@allaboard/ui/patterns/legacy-auth-patterns";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";

import { useLocale } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { useLandingShellActions } from "@/lib/use-landing-shell-actions";
import { DEFAULT_EMAIL_POST_LOGIN_PATH } from "@/lib/app-routes";
import { openLegalCgu } from "@/lib/open-legal-cgu";
import { submitProfileCompletion } from "@/lib/submit-profile-completion";

function OAuthOnboardingBody() {
  const labels = useLegacyLabels();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadMe() {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (cancelled) return;
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setErrorMessage(labels.auth.oauthError);
        setLoading(false);
        return;
      }
      const me = (await res.json()) as AuthMeResponse;
      if (me.cguAcceptedAt) {
        router.replace(DEFAULT_EMAIL_POST_LOGIN_PATH);
        return;
      }
      setProfile(me);
      setLoading(false);
    }
    void loadMe();
    return () => {
      cancelled = true;
    };
  }, [labels.auth.oauthError, router]);

  async function handleSubmit(input: OAuthOnboardingSubmitInput) {
    if (!input.acceptCgu) return;
    setSubmitting(true);
    setErrorMessage(null);

    const result = await submitProfileCompletion(input, { acceptLegal: true });
    if (!result.ok) {
      setErrorMessage(labels.auth.oauthError);
      setSubmitting(false);
      return;
    }

    router.replace(DEFAULT_EMAIL_POST_LOGIN_PATH);
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        …
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg justify-center px-4 py-10">
      <OAuthOnboardingForm
        labels={labels}
        initialFullName={profile?.fullName ?? profile?.displayName ?? ""}
        initialEducationLevel={profile?.educationLevel ?? ""}
        initialHeadline={profile?.headline ?? ""}
        submitting={submitting}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCguClick={() => openLegalCgu(locale)}
      />
    </div>
  );
}

export function OAuthOnboardingPage() {
  const labels = useLegacyLabels();
  const shellActions = useLandingShellActions();

  return (
    <LandingPageShell labels={labels} background="app" {...shellActions}>
      <OAuthOnboardingBody />
    </LandingPageShell>
  );
}
