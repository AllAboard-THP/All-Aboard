"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeedResponse } from "@allaboard/types";

import { Button } from "@/components/ui/button";

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
      <p className="mt-2 text-sm text-red-300">
        Erreur client : {q.error.message}
      </p>
    );
  }
  return (
    <div className="mt-2">
      <p className="text-sm text-emerald-200">
        useQuery : {q.data.items.length} entrée(s) — même source que le SSR (BFF{" "}
        <code className="text-slate-200">/api/feed</code>).
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
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
