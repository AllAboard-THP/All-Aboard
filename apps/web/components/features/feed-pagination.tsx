import { getTranslations } from "next-intl/server";

import { Button } from "@allaboard/ui/components/button";

import { Link } from "@/i18n/navigation";
import {
  feedPageHref,
  type FeedPageParams,
} from "@/lib/feed-search-params";

type Props = {
  params: FeedPageParams;
  page: number;
  limit: number;
  total: number;
  basePath?: string;
};

export async function FeedPagination({ params, page, limit, total, basePath }: Props) {
  const t = await getTranslations("feed");
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) {
    return null;
  }

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
      aria-label={t("paginationAria")}
      data-testid="feed-pagination"
    >
      <p className="m-0 text-sm text-muted-foreground">
        {t("paginationSummary", { page, totalPages, total })}
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={feedPageHref(params, page - 1, basePath)}>{t("paginationPrev")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {t("paginationPrev")}
          </Button>
        )}
        {hasNext ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={feedPageHref(params, page + 1, basePath)}>{t("paginationNext")}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {t("paginationNext")}
          </Button>
        )}
      </div>
    </nav>
  );
}
