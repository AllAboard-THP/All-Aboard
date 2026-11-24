import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { MissionFormPage } from "@/components/features/mission-form-page";
import { redirect } from "@/i18n/navigation";
import { fetchAuthMe, fetchMission, fetchSkills } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** Author only, while the mission is not completed or cancelled. */
export default async function EditMissionPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    redirect({ href: `/login?returnTo=${encodeURIComponent(`/missions/${id}/edit`)}`, locale });
  }
  const [result, me, skills] = await Promise.all([
    fetchMission(id, token!),
    fetchAuthMe(token!),
    fetchSkills(),
  ]);
  if (!result.ok) notFound();
  const mission = result.data.item;
  const viewerId = me.ok ? (me.data.id ?? me.data.userId) : null;
  if (
    mission.author.id !== viewerId ||
    mission.status === "completed" ||
    mission.status === "cancelled"
  ) {
    redirect({ href: `/missions/${id}`, locale });
  }
  return <MissionFormPage skills={skills.ok ? skills.data.items : []} initial={mission} />;
}
