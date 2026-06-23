import { LandingLoginPage } from "@/components/features/landing-login-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function PublicHomePage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LandingLoginPage />;
}
