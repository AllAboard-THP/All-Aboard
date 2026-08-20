import { LegalCguScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function LegalCguPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <LegalCguScreen />;
}
