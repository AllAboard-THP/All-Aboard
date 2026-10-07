import { fetchFeed, fetchSubjectBySlug } from "@/lib/api-server";
import { SubjectFeedContent } from "@/components/features/subject-feed-content";
import { parseFeedPageSearchParams } from "@/lib/feed-search-params";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const feedParams = parseFeedPageSearchParams({
    ...resolvedSearchParams,
    subject: slug,
  });

  const subjectResult = await fetchSubjectBySlug(slug);

  if (!subjectResult.ok) {
    return (
      <SubjectFeedContent
        subject={{
          id: "",
          name: slug,
          slug,
          icon: "",
          accentColor: "#6366f1",
          postsCount: 0,
        }}
        feed={null}
        feedError={null}
        params={feedParams}
        notFound={subjectResult.status === 404 || subjectResult.error === "not_found"}
      />
    );
  }

  const feedResult = await fetchFeed(feedParams);

  return (
    <SubjectFeedContent
      subject={subjectResult.data.item}
      feed={feedResult.ok ? feedResult.data : null}
      feedError={feedResult.ok ? null : feedResult.error}
      params={feedParams}
    />
  );
}
