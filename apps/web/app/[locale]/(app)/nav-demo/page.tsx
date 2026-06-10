import { NavWithAdminUserScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

/** Storybook nav state — admin user menu open. */
export default async function NavDemoPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <NavWithAdminUserScreen />;
}
