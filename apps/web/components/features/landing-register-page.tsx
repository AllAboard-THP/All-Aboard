"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@allaboard/ui/components/card";
import { GoogleSignInButton } from "@allaboard/ui/components/google-sign-in-button";
import { Separator } from "@allaboard/ui/components/separator";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";

import { PasskeyRegisterForm } from "@/components/features/passkey-register-form";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";
import { openLegalCgu } from "@/lib/open-legal-cgu";

type Props = {
  returnTo?: string;
};

/** Dedicated register page — chrome header + passkey signup (ADR 0006, no password). */
export function LandingRegisterPage({
  returnTo = DEFAULT_POST_LOGIN_PATH,
}: Props) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const labels = useLegacyLabels();
  const t = useTranslations("auth");

  return (
    <LandingPageShell
      labels={labels}
      background="app"
      activeAction="signUp"
      onSignInClick={() => router.push("/login")}
      onSignUpClick={() => router.push("/register")}
      onLogoClick={() => router.push("/")}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-4 sm:py-6">
        <Card className="w-full bg-card/90" data-testid="register-page-card">
          <CardHeader>
            <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
              {t("registerEyebrow")}
            </p>
            <h1 className="text-2xl leading-none font-semibold">
              {t("registerTitle")}
            </h1>
            <CardDescription>{t("registerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <GoogleSignInButton
              label={labels.auth.continueWithGoogle}
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
            />
            <div className="flex w-full items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {labels.auth.orContinueWithEmail}
              </span>
              <Separator className="flex-1" />
            </div>
            <PasskeyRegisterForm
              returnTo={returnTo}
              onCguClick={() => openLegalCgu(locale)}
            />
            <p className="m-0">
              <Link
                href="/"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("backHome")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </LandingPageShell>
  );
}
