import { FeedThreeColumnScreen } from "@allaboard/ui/patterns/screens/legacy-screens";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

/** Storybook feed layout — mock data, illustrated stage background. */
export default async function FeedDemoPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <FeedThreeColumnScreen />;
}
