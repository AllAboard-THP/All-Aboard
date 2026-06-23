import { LegalContentPage } from "@/components/features/legal-content-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegalPrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LegalContentPage slug="privacy" />;
}
