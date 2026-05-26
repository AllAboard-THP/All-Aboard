"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeedResponse } from "@allaboard/types";

import { Button } from "@allaboard/ui/components/button";

async function fetchFeedJson(): Promise<FeedResponse> {
  const res = await fetch("/api/feed");
  if (!res.ok) {
    throw new Error(`Feed ${res.status}`);
  }
  return (await res.json()) as FeedResponse;
}

export function FeedClientPreview() {
  const queryClient = useQueryClient();
  const q = useQuery({
    queryKey: ["feed"],
    queryFn: fetchFeedJson,
  });

  if (q.isPending) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Chargement du feed (client)…
      </p>
    );
  }
  if (q.isError) {
    return (
      <p className="mt-2 text-sm text-destructive">
        Erreur client : {q.error.message}
      </p>
    );
  }
  return (
    <div className="mt-2">
      <p className="m-0 text-sm text-primary">
        useQuery : {q.data.items.length} entrée(s) — même source que le SSR (BFF{" "}
        <code className="text-foreground">/api/feed</code>).
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["feed"] });
          }}
          aria-label="Rafraîchir le feed"
        >
          Rafraîchir
        </Button>
        {q.isFetching && !q.isPending ? (
          <span
            className="text-sm text-muted-foreground"
            data-testid="feed-refetching"
          >
            Mise à jour…
          </span>
        ) : null}
      </div>
    </div>
  );
}
