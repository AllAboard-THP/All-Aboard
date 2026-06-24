import { cookies } from "next/headers";

import { AdminDashboardContent } from "@/components/features/admin-dashboard-content";
import { initPageLocale } from "@/lib/init-page-locale";
import { fetchAdminDashboard } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminDashboardPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  const result =
    token ?
      await fetchAdminDashboard(token)
    : ({ ok: false as const, error: "unauthorized" });

  return (
    <AdminDashboardContent
      dashboard={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
    />
  );
}
