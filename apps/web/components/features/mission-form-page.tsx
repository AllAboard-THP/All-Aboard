import type { Mission, Skill } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { MissionForm } from "@/components/features/mission-form";
import { Link } from "@/i18n/navigation";

type Props = { skills: Skill[]; initial?: Mission };

/** Shell of `/missions/new` and `/missions/[id]/edit`. */
export async function MissionFormPage({ skills, initial }: Props) {
  const t = await getTranslations("missions.form");
  const tMissions = await getTranslations("missions");
  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{initial ? t("editTitle") : t("newTitle")}</CardTitle>
          <CardDescription>{t("intro")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MissionForm skills={skills} initial={initial} />
          <p className="mt-5">
            <Link
              href={initial ? `/missions/${initial.id}` : "/missions"}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {tMissions("backToList")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
