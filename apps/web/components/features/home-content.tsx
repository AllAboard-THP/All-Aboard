import type { FeedResponse, HelpRequest } from "@allaboard/types";
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

import { FeedClientPreview } from "@/components/features/feed-client-preview";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/format-datetime";
import { mapApiErrorToKey } from "@/lib/map-api-error";

type Props = {
  feed: FeedResponse | null;
  feedError: string | null;
};

function FeedItemCard({
  item,
  locale,
  authorLabel,
  tagsLabel,
}: {
  item: HelpRequest;
  locale: string;
  authorLabel: string;
  tagsLabel: string | null;
}) {
  const hasTags = Boolean(item.tags && item.tags.length > 0);

  return (
    <li>
      <Card className="w-full gap-0 py-4 transition-colors hover:border-primary/50">
        <CardHeader
          className={`gap-1.5 px-4 ${hasTags ? "pb-2" : "pb-0"}`}
        >
          <CardTitle className="text-lg">
            <Link
              href={`/requests/${item.id}`}
              className="text-foreground hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </CardTitle>
          <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
            <span>{authorLabel}</span>
            <span>{formatDateTime(item.createdAt, locale)}</span>
          </CardDescription>
        </CardHeader>
        {hasTags && tagsLabel ? (
          <CardContent className="px-4 pt-0">
            <p className="m-0 text-xs text-muted-foreground">{tagsLabel}</p>
          </CardContent>
        ) : null}
      </Card>
    </li>
  );
}

export async function HomeContent({ feed, feedError }: Props) {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tErrors = await getTranslations("errors");
  const hasItems = Boolean(feed && feed.items.length > 0);
  const feedErrorKey = feedError ? mapApiErrorToKey(feedError) : null;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          {t("description")}
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/help/new">{t("newRequestCta")}</Link>
          </Button>
        </div>
      </header>

      <section aria-label={t("feedSectionAriaLabel")}>
        {feedError ? (
          <Alert variant="destructive" data-testid="feed-ssr-error">
            <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
            <AlertDescription>
              {tErrors(feedErrorKey ?? "generic")}
            </AlertDescription>
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
                <Link href="/help/new">{t("publishRequest")}</Link>
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
              <FeedItemCard
                key={item.id}
                item={item}
                locale={locale}
                authorLabel={tCommon("author", { authorId: item.authorId })}
                tagsLabel={
                  item.tags && item.tags.length > 0
                    ? tCommon("tags", { tags: item.tags.join(", ") })
                    : null
                }
              />
            ))}
          </ul>
        ) : null}

        <div className="mt-4">
          <FeedClientPreview />
        </div>
      </section>
    </div>
  );
}
