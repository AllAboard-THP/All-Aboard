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

import { FeedPagination } from "@/components/features/feed-pagination";
import { PostCard, type PostCardLabels } from "@/components/features/post-card";
import { SubjectIcon } from "@/components/features/subject-icon";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { FeedPageParams } from "@/lib/feed-search-params";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  subject: Subject;
  feed: FeedResponse | null;
  feedError: string | null;
  params: FeedPageParams;
  notFound?: boolean;
};

export async function SubjectFeedContent({
  subject,
  feed,
  feedError,
  params,
  notFound = false,
}: Props) {
  const t = await getTranslations("subjects");
  const tFeed = await getTranslations("feed");
  const tPostCard = await getTranslations("postCard");
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as AppLocale;
  const hasItems = Boolean(feed && feed.items.length > 0);

  const postCardLabels: PostCardLabels = {
    author: (authorId) => tPostCard("author", { authorId }),
    formatDate: (iso) => formatDateTime(iso, locale),
    responsesCount: (count) => tPostCard("responsesCount", { count }),
    likesCount: (count) => tPostCard("likesCount", { count }),
    urgent: tPostCard("urgent"),
    resolved: tPostCard("resolved"),
    filterByTagAria: (tag) => tPostCard("filterByTagAria", { tag }),
  };

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-6xl p-6" data-testid="subject-not-found">
        <Alert variant="destructive">
          <AlertTitle>{t("notFoundTitle")}</AlertTitle>
          <AlertDescription>{t("notFoundDescription", { slug: params.subject ?? "" })}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/explore">{t("backToExplore")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-6" data-testid="subject-feed-page">
      <header className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link href="/explore">{t("backToExplore")}</Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <SubjectIcon
            icon={subject.icon}
            accentColor={subject.accentColor}
            name={subject.name}
          />
          <div className="min-w-0 space-y-2">
            <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
              {t("eyebrow")}
            </p>
            <h1 className="m-0 text-3xl font-semibold text-foreground md:text-4xl">
              {subject.name}
            </h1>
            {subject.description ? (
              <p className="m-0 max-w-prose text-base text-muted-foreground">
                {subject.description}
              </p>
            ) : null}
            <p className="m-0 text-sm text-muted-foreground">
              {t("postsCount", { count: subject.postsCount })}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button asChild>
            <Link href="/help/new">{tNav("newRequest")}</Link>
          </Button>
        </div>
      </header>

      <section aria-label={tFeed("sectionAria")}>
        {feedError ? (
          <Alert variant="destructive" data-testid="subject-feed-error">
            <AlertTitle>{tFeed("loadErrorTitle")}</AlertTitle>
            <AlertDescription>{feedError}</AlertDescription>
          </Alert>
        ) : null}

        {!feedError && feed && feed.items.length === 0 ? (
          <Card data-testid="subject-feed-empty">
            <CardHeader>
              <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
              <CardDescription>{t("emptyDescription", { name: subject.name })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/help/new">{tFeed("publishCta")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!feedError && hasItems ? (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="subject-feed-list"
          >
            {feed!.items.map((item) => (
              <li key={item.id}>
                <PostCard
                  item={item}
                  labels={postCardLabels}
                  showSocialActions
                  socialLoginReturnPath={`/subjects/${subject.slug}`}
                />
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
            basePath={`/subjects/${subject.slug}`}
          />
        ) : null}
      </section>
    </div>
  );
}
