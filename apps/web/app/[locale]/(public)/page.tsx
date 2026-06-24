import { cookies } from "next/headers";

import { LandingPresentationPage } from "@/components/features/landing-presentation-page";
import { redirect } from "@/i18n/navigation";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PublicHomePage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  if (token) {
    redirect({ href: "/feed", locale });
  }

  return <LandingPresentationPage />;
}
