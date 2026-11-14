import type { HelpRequest } from "@allaboard/types";
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

import { PostCard, type PostCardLabels } from "@/components/features/post-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

export type MyListKind = "posts" | "bookmarks";

type Props = {
  kind: MyListKind;
  items: HelpRequest[];
  loadError: string | null;
};

export async function MyListContent({ kind, items, loadError }: Props) {
  const t = await getTranslations("social");
  const tPostCard = await getTranslations("postCard");
  const tFeed = await getTranslations("feed");
  const locale = (await getLocale()) as AppLocale;

  const postCardLabels: PostCardLabels = {
    author: (authorId) => tPostCard("author", { authorId }),
    formatDate: (iso) => formatDateTime(iso, locale),
    responsesCount: (count) => tPostCard("responsesCount", { count }),
    likesCount: (count) => tPostCard("likesCount", { count }),
    urgent: tPostCard("urgent"),
    resolved: tPostCard("resolved"),
    filterByTagAria: (tag) => tPostCard("filterByTagAria", { tag }),
  };

  const title = kind === "posts" ? t("myPostsTitle") : t("myBookmarksTitle");
  const description =
    kind === "posts" ? t("myPostsDescription") : t("myBookmarksDescription");
  const sectionAria =
    kind === "posts" ? t("myPostsSectionAria") : t("myBookmarksSectionAria");
  const emptyTitle =
    kind === "posts" ? t("myPostsEmptyTitle") : t("myBookmarksEmptyTitle");
  const emptyDescription =
    kind === "posts"
      ? t("myPostsEmptyDescription")
      : t("myBookmarksEmptyDescription");
  const emptyCta =
    kind === "posts" ? t("myPostsEmptyCta") : t("myBookmarksEmptyCta");
  const emptyCtaHref = kind === "posts" ? "/help/new" : "/";
  const loginReturnPath = kind === "posts" ? "/me/posts" : "/me/bookmarks";

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {title}
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          {description}
        </p>
        {kind === "bookmarks" && items.length > 0 ? (
          <p className="mt-2 mb-0 text-sm text-muted-foreground">
            {t("myBookmarksCount", { count: items.length })}
          </p>
        ) : null}
      </header>

      {loadError ? (
        <Alert variant="destructive" data-testid="my-list-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {!loadError && items.length === 0 ? (
        <Card data-testid="my-list-empty">
          <CardHeader>
            <CardTitle className="text-lg">{emptyTitle}</CardTitle>
            <CardDescription>{emptyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href={emptyCtaHref}>{emptyCta}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!loadError && items.length > 0 ? (
        <section aria-label={sectionAria}>
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="my-list-items"
          >
            {items.map((item) => (
              <li key={item.id}>
                <PostCard
                  item={item}
                  labels={postCardLabels}
                  showSocialActions
                  socialLoginReturnPath={loginReturnPath}
                  defaultBookmarked={kind === "bookmarks" ? true : undefined}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
