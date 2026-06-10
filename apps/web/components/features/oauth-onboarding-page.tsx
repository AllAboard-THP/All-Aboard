"use client";

import { useEffect, useState } from "react";
import type { AuthMeResponse } from "@allaboard/types";

import {
  OAuthOnboardingForm,
  type OAuthOnboardingSubmitInput,
} from "@allaboard/ui/patterns/legacy-auth-patterns";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";

import { useRouter } from "@/i18n/navigation";

function OAuthOnboardingBody() {
  const labels = useLegacyLabels();
  const router = useRouter();
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
        router.replace("/feed");
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
    try {
      const patchRes = await fetch("/api/users/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: input.fullName,
          educationLevel: input.educationLevel ?? null,
          headline: input.headline ?? null,
        }),
      });
      if (!patchRes.ok) {
        throw new Error("profile_update_failed");
      }

      const legalRes = await fetch("/api/legal/accept", {
        method: "POST",
        credentials: "include",
      });
      if (!legalRes.ok) {
        throw new Error("cgu_accept_failed");
      }

      router.replace("/feed");
    } catch {
      setErrorMessage(labels.auth.oauthError);
      setSubmitting(false);
    }
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
      />
    </div>
  );
}

export function OAuthOnboardingPage() {
  const labels = useLegacyLabels();

  return (
    <LandingPageShell labels={labels} background="app">
      <OAuthOnboardingBody />
    </LandingPageShell>
  );
}
