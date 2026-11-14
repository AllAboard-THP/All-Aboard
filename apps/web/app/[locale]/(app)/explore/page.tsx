import { fetchSubjects } from "@/lib/api-server";
import { ExploreContent } from "@/components/features/explore-content";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const subjectsResult = await fetchSubjects();

  return (
    <ExploreContent
      subjects={subjectsResult.ok ? subjectsResult.data.items : []}
      error={subjectsResult.ok ? null : subjectsResult.error}
    />
  );
}
