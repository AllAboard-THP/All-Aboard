"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeedResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";

import { Button } from "@allaboard/ui/components/button";

async function fetchFeedJson(): Promise<FeedResponse> {
  const res = await fetch("/api/feed");
  if (!res.ok) {
    throw new Error(`Feed ${res.status}`);
  }
  return (await res.json()) as FeedResponse;
}

export function FeedClientPreview() {
  const t = useTranslations("feed");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeedJson,
  });

  if (q.isPending) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">{t("clientLoading")}</p>
    );
  }
  if (q.isError) {
    return (
      <p className="mt-2 text-sm text-destructive">
        {t("clientError", { message: q.error.message })}
      </p>
    );
  }
  return (
    <div className="mt-2">
      <p className="m-0 text-sm text-primary">
        {t("clientPreview", {
          count: q.data.items.length,
          bff: "/api/feed",
        })}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["feed"] });
          }}
          aria-label={t("refreshAria")}
        >
          {t("refresh")}
        </Button>
        {q.isFetching && !q.isPending ? (
          <span
            className="text-sm text-muted-foreground"
            data-testid="feed-refetching"
          >
            {tCommon("updating")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
