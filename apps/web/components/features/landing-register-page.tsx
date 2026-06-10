"use client";

import { useState } from "react";

import type { LegacyLabels } from "@allaboard/ui/i18n/legacy-labels";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import type { RegisterSubmitInput } from "@allaboard/ui/patterns/register-form";
import { RegisterScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { useLocale } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { openLegalCgu } from "@/lib/open-legal-cgu";

function mapRegisterError(
  error: string | undefined,
  labels: LegacyLabels,
): string {
  switch (error) {
    case "email_taken":
      return labels.auth.registerEmailTaken;
    case "invalid_body":
      return labels.auth.registerPasswordMismatch;
    default:
      return labels.auth.registerGenericError;
  }
}

/** Dedicated register page — wired to apps/web BFF; locale via root `LocaleBridge`. */
export function LandingRegisterPage() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const labels = useLegacyLabels();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(input: RegisterSubmitInput) {
    if (!input.acceptCgu) return;
    if (input.password !== input.passwordConfirmation) {
      setErrorMessage(labels.auth.registerPasswordMismatch);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          passwordConfirmation: input.passwordConfirmation,
          fullName: input.fullName,
          acceptCgu: input.acceptCgu,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setErrorMessage(mapRegisterError(body.error, labels));
        setSubmitting(false);
        return;
      }

      router.replace("/feed");
    } catch {
      setErrorMessage(labels.auth.registerGenericError);
      setSubmitting(false);
    }
  }

  return (
    <RegisterScreen
      onSignInClick={() => router.push("/")}
      onGoogleSignInClick={() => {
        window.location.href = "/api/auth/google";
      }}
      onSubmit={handleSubmit}
      onCguClick={() => openLegalCgu(locale)}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
}
