/** Construit l'URL de redirection Rubberduck avec contexte minimal de la demande. */
export function buildRubberduckRedirectUrl(
  baseUrl: string,
  params: { requestId: string; title: string },
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("requestId", params.requestId);
  url.searchParams.set("title", params.title);
  return url.toString();
}

async function fetchRubberduckRedirectUrl(): Promise<string | null> {
  const res = await fetch("/api/rubberduck/redirect", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { url?: string | null };
  const url = data.url?.trim();
  return url && url.length > 0 ? url : null;
}

export { fetchRubberduckRedirectUrl };
