import { cookies } from "next/headers";

import { AdminDenylistContent } from "@/components/features/admin-denylist-content";
import { initPageLocale } from "@/lib/init-page-locale";
import { fetchAdminDenylistPatterns } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminDenylistPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  const result =
    token ?
      await fetchAdminDenylistPatterns(token)
    : ({ ok: false as const, error: "unauthorized" });

  return (
    <AdminDenylistContent
      patterns={result.ok ? result.data.items : null}
      error={result.ok ? null : result.error}
    />
  );
}
