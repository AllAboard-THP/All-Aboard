import { cookies } from "next/headers";

import { AdminUsersContent } from "@/components/features/admin-users-content";
import { initPageLocale } from "@/lib/init-page-locale";
import { fetchAdminUsers } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminUsersPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  const result =
    token ?
      await fetchAdminUsers(token)
    : ({ ok: false as const, error: "unauthorized" });

  return (
    <AdminUsersContent
      users={result.ok ? result.data.items : null}
      error={result.ok ? null : result.error}
    />
  );
}
