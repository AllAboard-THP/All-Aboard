import { cookies } from "next/headers";

import { LandingRegisterPage } from "@/components/features/landing-register-page";
import { redirect } from "@/i18n/navigation";
import { initPageLocale } from "@/lib/init-page-locale";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";
import { sanitizeReturnTo } from "@/lib/sanitize-return-to";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function RegisterPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  const { returnTo: returnToParam } = await searchParams;
  const returnTo = sanitizeReturnTo(returnToParam) ?? DEFAULT_POST_LOGIN_PATH;

  const token = (await cookies()).get("access_token")?.value;
  if (token) {
    redirect({ href: returnTo, locale });
  }

  return <LandingRegisterPage returnTo={returnTo} />;
}
