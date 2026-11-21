"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";

import { useRouter } from "@/i18n/navigation";
import {
  resourcesHref,
  type ResourcesPageParams,
} from "@/lib/resources-search-params";

type Props = {
  params: ResourcesPageParams;
};

export function ResourcesSearchForm({ params }: Props) {
  const t = useTranslations("resources");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.q ?? "");

  useEffect(() => {
    setSearch(params.q ?? "");
  }, [params.q]);

  function navigate(next: ResourcesPageParams) {
    startTransition(() => {
      router.push(resourcesHref(next));
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = search.trim();
    navigate({
      ...params,
      page: 1,
      q: q.length > 0 ? q : undefined,
    });
  }

  function clearSearch() {
    setSearch("");
    navigate({
      page: 1,
      limit: params.limit,
    });
  }

  return (
    <div className="mb-6 space-y-2" data-testid="resources-search-form">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <Input
          type="search"
          name="q"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          className="max-w-md flex-1"
          autoComplete="off"
          disabled={isPending}
        />
        <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
          {t("searchSubmit")}
        </Button>
        {params.q ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={clearSearch}
          >
            {t("clearSearch")}
          </Button>
        ) : null}
      </form>

      {params.q ? (
        <p className="m-0 text-sm text-muted-foreground">
          {t("searchResultsHint", { query: params.q })}
        </p>
      ) : null}

      {isPending ? (
        <p
          className="m-0 text-sm text-muted-foreground"
          data-testid="resources-search-pending"
        >
          {t("filterPending")}
        </p>
      ) : null}
    </div>
  );
}
