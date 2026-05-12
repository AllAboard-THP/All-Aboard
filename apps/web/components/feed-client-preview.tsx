"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FeedResponse } from "@allaboard/types";

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
      <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: "14px" }}>
        Chargement du feed (client)…
      </p>
    );
  }
  if (q.isError) {
    return (
      <p style={{ margin: "8px 0 0", color: "#fca5a5", fontSize: "14px" }}>
        Erreur client : {q.error.message}
      </p>
    );
  }
  return (
    <div style={{ marginTop: "8px" }}>
      <p style={{ margin: 0, color: "#86efac", fontSize: "14px" }}>
        useQuery : {q.data.items.length} entrée(s) — même source que le SSR (BFF{" "}
        <code style={{ color: "#cbd5e1" }}>/api/feed</code>).
      </p>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["feed"] });
          }}
          style={{
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid rgba(148, 163, 184, 0.45)",
            background: "rgba(30, 41, 59, 0.6)",
            color: "#e2e8f0",
            padding: "6px 12px",
            fontSize: "13px",
            fontWeight: 600,
          }}
          aria-label="Rafraîchir le feed"
        >
          Rafraîchir
        </button>
        {q.isFetching && !q.isPending ? (
          <span style={{ color: "#94a3b8", fontSize: "13px" }} data-testid="feed-refetching">
            Mise à jour…
          </span>
        ) : null}
      </div>
    </div>
  );
}
