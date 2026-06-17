import { getTranslations } from "next-intl/server";

import { Button } from "@allaboard/ui/components/button";

import { Link } from "@/i18n/navigation";
import {
  resourcesPageHref,
  type ResourcesPageParams,
} from "@/lib/resources-search-params";

type Props = {
  params: ResourcesPageParams;
  page: number;
  limit: number;
  total: number;
};

export async function ResourcesPagination({
  params,
  page,
  limit,
  total,
}: Props) {
  const t = await getTranslations("resources");
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
      data-testid="resources-pagination"
    >
      <p className="m-0 text-sm text-muted-foreground">
        {t("paginationSummary", { page, totalPages, total })}
      </p>
      <div className="flex gap-2">
        {hasPrev ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={resourcesPageHref(params, page - 1)}>
              {t("paginationPrev")}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            {t("paginationPrev")}
          </Button>
        )}
        {hasNext ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={resourcesPageHref(params, page + 1)}>
              {t("paginationNext")}
            </Link>
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
