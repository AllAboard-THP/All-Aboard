import { fetchFeed } from "@/lib/api-server";
import { HomeContent } from "@/components/home-content";

export default async function HomePage() {
  const result = await fetchFeed();
  return (
    <HomeContent
      feed={result.ok ? result.data : null}
      feedError={result.ok ? null : result.error}
    />
  );
}
