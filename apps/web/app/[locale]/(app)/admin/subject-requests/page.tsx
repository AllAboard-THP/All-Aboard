import { cookies } from "next/headers";

import { AdminSubjectRequestsContent } from "@/components/features/admin-subject-requests-content";
import { initPageLocale } from "@/lib/init-page-locale";
import { fetchAdminSubjectRequests } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminSubjectRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  const result =
    token ?
      await fetchAdminSubjectRequests(token)
    : ({ ok: false as const, error: "unauthorized" });

  return (
    <AdminSubjectRequestsContent
      subjectRequests={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
    />
  );
}
