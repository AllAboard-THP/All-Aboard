import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { MissionFormPage } from "@/components/features/mission-form-page";
import { redirect } from "@/i18n/navigation";
import { fetchAuthMe, fetchSkills } from "@/lib/api-server";

export const dynamic = "force-dynamic";

/** Mentors only: anyone else goes back to the list. */
export default async function NewMissionPage() {
  const locale = await getLocale();
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    redirect({ href: "/login?returnTo=%2Fmissions%2Fnew", locale });
  }
  const [me, skills] = await Promise.all([fetchAuthMe(token!), fetchSkills()]);
  if (!me.ok || me.data.role !== "mentor") {
    redirect({ href: "/missions", locale });
  }
  return <MissionFormPage skills={skills.ok ? skills.data.items : []} />;
}
