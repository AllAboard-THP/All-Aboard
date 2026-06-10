import { RegisterScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <RegisterScreen />;
}
