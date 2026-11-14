import { cookies } from "next/headers";

import { fetchResource } from "@/lib/api-server";
import { ResourceDetailContent } from "@/components/features/resource-detail-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const result = await fetchResource(id, token);

  if (result.ok) {
    return (
      <ResourceDetailContent
        id={id}
        detail={result.data}
        detailError={null}
        notFound={false}
      />
    );
  }

  if (result.status === 404 || result.error === "not_found") {
    return (
      <ResourceDetailContent
        id={id}
        detail={null}
        detailError={null}
        notFound={true}
      />
    );
  }

  return (
    <ResourceDetailContent
      id={id}
      detail={null}
      detailError={result.error}
      notFound={false}
    />
  );
}
