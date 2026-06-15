import type { FeedResponse, Subject } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { FeedFilters } from "@/components/features/feed-filters";
import { FeedPagination } from "@/components/features/feed-pagination";
import { PostCard, type PostCardLabels } from "@/components/features/post-card";
import { UnansweredWidget } from "@/components/features/unanswered-widget";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { FeedPageParams } from "@/lib/feed-search-params";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
  subjects: Subject[];
  params: FeedPageParams;
};

export async function HomeContent({
  feed,
  feedError,
  subjects,
  params,
}: Props) {
  const t = await getTranslations("feed");
  const tPostCard = await getTranslations("postCard");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;
  const hasItems = Boolean(feed && feed.items.length > 0);
  const unanswered = feed?.widgets?.unanswered ?? [];

  const postCardLabels: PostCardLabels = {
    author: (authorId) => tPostCard("author", { authorId }),
    formatDate: (iso) => formatDateTime(iso, locale),
    responsesCount: (count) => tPostCard("responsesCount", { count }),
    likesCount: (count) => tPostCard("likesCount", { count }),
    urgent: tPostCard("urgent"),
    resolved: tPostCard("resolved"),
    filterByTagAria: (tag) => tPostCard("filterByTagAria", { tag }),
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {tCommon("brand")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/help/new">{tNav("newRequest")}</Link>
          </Button>
        </div>
      </header>

      <FeedFilters subjects={subjects} params={params} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-label={t("sectionAria")}>
          {feedError ? (
            <Alert variant="destructive" data-testid="feed-ssr-error">
              <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
              <AlertDescription>{feedError}</AlertDescription>
            </Alert>
          ) : null}

          {!feedError && feed && feed.items.length === 0 ? (
            <Card data-testid="feed-empty">
              <CardHeader>
                <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
                <CardDescription>{t("emptyDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/help/new">{t("publishCta")}</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {!feedError && hasItems ? (
            <ul
              className="flex list-none flex-col gap-3 p-0"
              data-testid="feed-ssr-list"
            >
              {feed!.items.map((item) => (
                <li key={item.id}>
                  <PostCard item={item} labels={postCardLabels} />
                </li>
              ))}
            </ul>
          ) : null}

          {!feedError && feed?.pagination ? (
            <FeedPagination
              params={params}
              page={feed.pagination.page}
              limit={feed.pagination.limit}
              total={feed.pagination.total}
            />
          ) : null}
        </section>

        {!feedError && unanswered.length > 0 ? (
          <UnansweredWidget items={unanswered} labels={postCardLabels} />
        ) : null}
      </div>
    </div>
  );
}
