import { LegalContentPage } from "@/components/features/legal-content-page";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegalCguPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LegalContentPage slug="cgu" />;
}
