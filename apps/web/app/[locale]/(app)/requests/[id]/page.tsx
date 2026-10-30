import { HelpRequestDetailContent } from "@/components/features/help-request-detail-content";
import { fetchHelpRequest } from "@/lib/api-server";
import { initPageLocale } from "@/lib/init-page-locale";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function HelpRequestDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  initPageLocale(locale);
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
