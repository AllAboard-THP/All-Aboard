import type { ResourcesListResponse } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { ResourceCard } from "@/components/features/resource-card";
import { ResourcesNewCta } from "@/components/features/resources-new-cta";
import { ResourcesPagination } from "@/components/features/resources-pagination";
import { ResourcesSearchForm } from "@/components/features/resources-search-form";
import type { ResourcesPageParams } from "@/lib/resources-search-params";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  data: ResourcesListResponse | null;
  error: string | null;
  params: ResourcesPageParams;
};

export async function ResourcesListContent({ data, error, params }: Props) {
  const t = await getTranslations("resources");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;
  const items = data?.items ?? [];
  const hasSearch = Boolean(params.q);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {tCommon("brand")}
          </p>
          <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="m-0 max-w-prose text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <ResourcesNewCta />
      </header>

      <ResourcesSearchForm params={params} />

      {error ? (
        <Alert variant="destructive" data-testid="resources-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!error && items.length === 0 && hasSearch ? (
        <Card data-testid="resources-empty-search">
          <CardHeader>
            <CardTitle className="text-lg">{t("emptySearchTitle")}</CardTitle>
            <CardDescription>
              {t("emptySearchDescription", { query: params.q ?? "" })}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!error && items.length === 0 && !hasSearch ? (
        <Card data-testid="resources-empty">
          <CardHeader>
            <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
            <CardDescription>{t("emptyDescription")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!error && items.length > 0 ? (
        <section aria-label={t("listSectionAria")}>
          {hasSearch ? (
            <p className="mb-4 text-sm text-muted-foreground">
              {t("searchResults", { count: data!.pagination.total, query: params.q ?? "" })}
            </p>
          ) : null}
          <ul
            className="flex list-none flex-col gap-4 p-0"
            data-testid="resources-list"
          >
            {items.map((resource) => (
              <li key={resource.id}>
                <ResourceCard resource={resource} locale={locale} />
              </li>
            ))}
          </ul>
          {data?.pagination ? (
            <ResourcesPagination
              params={params}
              page={data.pagination.page}
              limit={data.pagination.limit}
              total={data.pagination.total}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
