import { LegalPrivacyScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegalPrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LegalPrivacyScreen />;
}
