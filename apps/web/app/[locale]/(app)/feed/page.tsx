import { fetchFeed, fetchSubjects } from "@/lib/api-server";
import { HomeContent } from "@/components/features/home-content";
import { parseFeedPageSearchParams } from "@/lib/feed-search-params";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const params = parseFeedPageSearchParams(resolvedSearchParams);

  const [feedResult, subjectsResult] = await Promise.all([
    fetchFeed(params),
    fetchSubjects(),
  ]);

  return (
    <HomeContent
      feed={feedResult.ok ? feedResult.data : null}
      feedError={feedResult.ok ? null : feedResult.error}
      subjects={subjectsResult.ok ? subjectsResult.data.items : []}
      params={params}
    />
  );
}
