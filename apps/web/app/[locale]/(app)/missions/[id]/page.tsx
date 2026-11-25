import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { MissionDetailContent } from "@/components/features/mission-detail-content";
import { redirect } from "@/i18n/navigation";
import { fetchAuthMe, fetchMission } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function MissionPage({ params }: Props) {
  const { id } = await params;
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    const locale = await getLocale();
    redirect({ href: `/login?returnTo=${encodeURIComponent(`/missions/${id}`)}`, locale });
  }

  const [result, me] = await Promise.all([fetchMission(id, token!), fetchAuthMe(token!)]);
  if (!result.ok) {
    if (result.status === 404) notFound();
    throw new Error(result.error);
  }
  return (
    <MissionDetailContent
      mission={result.data.item}
      viewerId={me.ok ? (me.data.id ?? me.data.userId) : ""}
    />
  );
}
