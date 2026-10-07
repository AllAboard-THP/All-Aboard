import { OAuthOnboardingPage } from "@/components/features/oauth-onboarding-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <OAuthOnboardingPage />;
}
