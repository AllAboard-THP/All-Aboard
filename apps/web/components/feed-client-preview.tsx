"use client";

import { useQuery } from "@tanstack/react-query";
import type { FeedResponse } from "@allaboard/types";

async function fetchFeedJson(): Promise<FeedResponse> {
  const res = await fetch("/api/feed");
  if (!res.ok) {
    throw new Error(`Feed ${res.status}`);
  }
  return (await res.json()) as FeedResponse;
}

export function FeedClientPreview() {
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
    <p style={{ margin: "8px 0 0", color: "#86efac", fontSize: "14px" }}>
      useQuery : {q.data.items.length} entrée(s) — même source que le SSR (BFF{" "}
      <code style={{ color: "#cbd5e1" }}>/api/feed</code>).
    </p>
  );
}
