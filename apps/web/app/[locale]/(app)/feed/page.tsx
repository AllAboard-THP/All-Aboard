import { HomeContent } from "@/components/features/home-content";
import { fetchFeed } from "@/lib/api-server";
import { initPageLocale } from "@/lib/init-page-locale";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function FeedPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  const result = await fetchFeed();
  return (
    <HomeContent
      feed={result.ok ? result.data : null}
      feedError={result.ok ? null : result.error}
    />
  );
}
