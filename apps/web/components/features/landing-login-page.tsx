"use client";

import { useLocale } from "next-intl";

import { LandingLoginScreen } from "@allaboard/ui/patterns/screens/legacy-screens";
import {
  StorybookLocaleProvider,
  type StorybookLocale,
} from "@allaboard/ui/i18n/storybook-locale";

import { useRouter } from "@/i18n/navigation";

/** Landing login — wired to apps/web auth routes + next-intl locale. */
export function LandingLoginPage() {
  const router = useRouter();
  const locale = useLocale() as StorybookLocale;

  return (
    <StorybookLocaleProvider locale={locale}>
      <LandingLoginScreen
        onForgotPasswordClick={() => router.push("/forgot-password")}
        onSignUpClick={() => router.push("/register")}
      />
    </StorybookLocaleProvider>
  );
}
