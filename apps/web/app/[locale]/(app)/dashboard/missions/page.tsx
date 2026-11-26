import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { MissionBoard } from "@/components/features/mission-board";
import { redirect } from "@/i18n/navigation";
import {
  fetchAuthMe,
  fetchMyMissionApplications,
  fetchMyMissions,
} from "@/lib/api-server";

export const dynamic = "force-dynamic";

/** Dashboard board: missions the viewer posted, and their own applications. */
export default async function DashboardMissionsPage() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    const locale = await getLocale();
    redirect({ href: "/login?returnTo=%2Fdashboard%2Fmissions", locale });
  }
  const [me, authored, applications] = await Promise.all([
    fetchAuthMe(token!),
    fetchMyMissions(token!),
    fetchMyMissionApplications(token!),
  ]);
  return (
    <MissionBoard
      authored={authored.ok ? authored.data.items : null}
      applications={applications.ok ? applications.data.items : null}
      canPost={me.ok && me.data.role === "mentor"}
    />
  );
}
