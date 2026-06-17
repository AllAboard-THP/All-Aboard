import { fetchResources } from "@/lib/api-server";
import { ResourcesListContent } from "@/components/features/resources-list-content";
import { parseResourcesPageSearchParams } from "@/lib/resources-search-params";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResourcesPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const params = parseResourcesPageSearchParams(resolvedSearchParams);

  const result = await fetchResources(params);

  return (
    <ResourcesListContent
      data={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
      params={params}
    />
  );
}
