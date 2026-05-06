import type { HelpRequest } from "@allaboard/types";

export const dynamic = "force-dynamic";

async function getFeed(baseUrl: string): Promise<HelpRequest[]> {
  const res = await fetch(`${baseUrl}/feed`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }
  const data: unknown = await res.json();
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: HelpRequest[] }).items;
  }
  return [];
}

export default async function HomePage() {
  const apiBase =
    process.env.API_URL ?? process.env.INTERNAL_API_URL ?? "http://127.0.0.1:4000";
  const items = await getFeed(apiBase);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">All-Aboard feed</h1>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded border border-neutral-200 p-2">
            <span className="font-medium">{item.title}</span>
            <span className="ml-2 text-sm text-neutral-500">{item.authorId}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
