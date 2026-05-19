import type { FeedResponse } from "@allaboard/types";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FeedCard } from "@/components/feed/feed-card";
import { FeedEmpty } from "@/components/feed/feed-empty";
import { PageHeading } from "@/components/page-heading";
import { fetchFeed } from "@/lib/api-server";

export default async function FeedPage() {
  const result = await fetchFeed();
  const feed: FeedResponse | null = result.ok ? result.data : null;

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6" data-testid="feed-page">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Feed</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeading
        title="Feed"
        description="Requêtes et réponses de la communauté (données via GET /feed)."
      />

      <section className="mt-8 space-y-4" aria-label="Liste du feed">
        {feed && feed.items.length > 0 ? (
          feed.items.map((item) => (
            <FeedCard
              key={item.id}
              id={item.id}
              title={item.title}
              excerpt="Aperçu de la requête — détail à venir."
              tag="Requête"
            />
          ))
        ) : (
          <FeedEmpty
            message={
              result.ok
                ? "Aucune entrée dans le feed."
                : `Feed indisponible : ${result.error}`
            }
          />
        )}
      </section>
    </div>
  );
}
