"use client";

import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import { LandingPageShell } from "@allaboard/ui/patterns/landing-page-shell";

import { PasskeyLoginForm } from "@/components/features/passkey-login-form";
import { Link, useRouter } from "@/i18n/navigation";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";

type Props = {
  returnTo?: string;
};

/** Dedicated login page — chrome header + passkey form (separate from marketing `/`). */
export function LandingAuthLoginPage({
  returnTo = DEFAULT_POST_LOGIN_PATH,
}: Props) {
  const router = useRouter();
  const labels = useLegacyLabels();
  const t = useTranslations("auth");

  return (
    <LandingPageShell
      labels={labels}
      background="app"
      activeAction="signIn"
      onSignInClick={() => router.push("/login")}
      onSignUpClick={() => router.push("/register")}
      onLogoClick={() => router.push("/")}
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-4 sm:py-6">
        <Card className="w-full bg-card/90" data-testid="login-page-card">
          <CardHeader>
            <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
              {t("loginEyebrow")}
            </p>
            <CardTitle className="text-2xl leading-none font-semibold">
              {t("loginTitle")}
            </CardTitle>
            <CardDescription>{t("loginDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <PasskeyLoginForm returnTo={returnTo} />
            <p className="mt-5">
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
