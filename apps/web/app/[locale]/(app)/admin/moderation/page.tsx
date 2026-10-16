import { cookies } from "next/headers";

import { AdminModerationContent } from "@/components/features/admin-moderation-content";
import { initPageLocale } from "@/lib/init-page-locale";
import { fetchAdminModeration } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminModerationPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);

  const token = (await cookies()).get("access_token")?.value;
  const result =
    token ?
      await fetchAdminModeration(token)
    : ({ ok: false as const, error: "unauthorized" });

  return (
    <AdminModerationContent
      moderation={result.ok ? result.data : null}
      error={result.ok ? null : result.error}
    />
  );
}
