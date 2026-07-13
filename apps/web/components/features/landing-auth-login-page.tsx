"use client";

import { useTranslations } from "next-intl";

import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import { LoginDedicatedBody } from "@allaboard/ui/patterns/login-dedicated-body";
import { LoginDedicatedShell } from "@allaboard/ui/patterns/login-dedicated-shell";

import { PasskeyLoginForm } from "@/components/features/passkey-login-form";
import { useRouter } from "@/i18n/navigation";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";

type Props = {
  returnTo?: string;
};

/** Dedicated `/login` — hero background, header/footer chrome, centered glass card. */
export function LandingAuthLoginPage({
  returnTo = DEFAULT_POST_LOGIN_PATH,
}: Props) {
  const router = useRouter();
  const labels = useLegacyLabels();
  const t = useTranslations("auth");

  return (
    <LoginDedicatedShell
      labels={labels}
      activeAction="signIn"
      onLogoClick={() => router.push("/")}
      onSignInClick={() => router.push("/login")}
      onSignUpClick={() => router.push("/register")}
    >
      <LoginDedicatedBody
        labels={labels}
        title={t("loginTitle")}
        subtitle={t("loginDescription")}
      >
        <PasskeyLoginForm returnTo={returnTo} variant="dedicated" />
      </LoginDedicatedBody>
    </LoginDedicatedShell>
  );
}
