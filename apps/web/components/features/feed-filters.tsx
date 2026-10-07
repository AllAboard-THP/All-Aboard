"use client";

import { useEffect, useState, useTransition } from "react";
import type { Subject } from "@allaboard/types";
import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";
import { Input } from "@allaboard/ui/components/input";

import { useRouter } from "@/i18n/navigation";
import {
  feedHref,
  type FeedPageParams,
} from "@/lib/feed-search-params";

type Props = {
  subjects: Subject[];
  params: FeedPageParams;
};

export function FeedFilters({ subjects, params }: Props) {
  const t = useTranslations("feed");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.q ?? "");

  useEffect(() => {
    setSearch(params.q ?? "");
  }, [params.q]);

  function navigate(next: FeedPageParams) {
    startTransition(() => {
      router.push(feedHref(next));
    });
  }

  function handleSubjectClick(slug: string) {
    const nextSubject = params.subject === slug ? undefined : slug;
    navigate({
      ...params,
      page: 1,
      subject: nextSubject,
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

  function clearFilters() {
    setSearch("");
    navigate({
      page: 1,
      limit: params.limit,
    });
  }

  const hasActiveFilters = Boolean(params.subject || params.tag || params.q);

  return (
    <div className="mb-6 space-y-4" data-testid="feed-filters">
      {subjects.length > 0 ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={t("subjectFilterAria")}
        >
          {subjects.map((subject) => {
            const selected = params.subject === subject.slug;
            return (
              <Button
                key={subject.id}
                type="button"
                size="sm"
                variant={selected ? "default" : "outline"}
                aria-pressed={selected}
                disabled={isPending}
                onClick={() => handleSubjectClick(subject.slug)}
                style={
                  selected
                    ? {
                        backgroundColor: subject.accentColor,
                        borderColor: subject.accentColor,
                      }
                    : {
                        borderColor: `${subject.accentColor}66`,
                        color: subject.accentColor,
                      }
                }
              >
                {subject.name}
              </Button>
            );
          })}
        </div>
      ) : null}

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
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={clearFilters}
          >
            {t("clearFilters")}
          </Button>
        ) : null}
      </form>

      {params.tag ? (
        <p className="m-0 text-sm text-muted-foreground">
          {t("activeTagFilter", { tag: params.tag })}
          {" · "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() =>
              navigate({
                ...params,
                page: 1,
                tag: undefined,
              })
            }
          >
            {t("clearTagFilter")}
          </button>
        </p>
      ) : null}

      {isPending ? (
        <p
          className="m-0 text-sm text-muted-foreground"
          data-testid="feed-filter-pending"
        >
          {t("filterPending")}
        </p>
      ) : null}
    </div>
  );
}
