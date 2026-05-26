import { fetchHelpRequest } from "@/lib/api-server";
import { HelpRequestDetailContent } from "@/components/features/help-request-detail-content";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function HelpRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await fetchHelpRequest(id);

  if (result.ok) {
    return (
      <HelpRequestDetailContent
        id={id}
        detail={result.data}
        detailError={null}
        notFound={false}
      />
    );
  }

  if (result.status === 404 || result.error === "not_found") {
    return (
      <HelpRequestDetailContent
        id={id}
        detail={null}
        detailError={null}
        notFound={true}
      />
    );
  }

  return (
    <HelpRequestDetailContent
      id={id}
      detail={null}
      detailError={result.error}
      notFound={false}
    />
  );
}
