import type { Mission } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { MissionApplyPanel } from "@/components/features/mission-apply-panel";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDate } from "@/lib/format-datetime";

type Props = {
  mission: Mission;
  viewerId: string;
};

export async function MissionDetailContent({ mission, viewerId }: Props) {
  const t = await getTranslations("missions");
  const locale = (await getLocale()) as AppLocale;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <p className="mb-4">
        <Link href="/missions" className="text-sm font-semibold text-primary hover:underline">
          {t("backToList")}
        </Link>
      </p>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t(`kind.${mission.kind}`)}</Badge>
            <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
          </div>
          <CardTitle className="text-2xl" data-testid="mission-title">
            {mission.title}
          </CardTitle>
          <p className="m-0 text-sm text-muted-foreground">
            {t.rich("postedBy", {
              author: () => (
                <Link
                  href={`/users/${mission.author.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {mission.author.displayName}
                </Link>
              ),
            })}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="m-0 text-base leading-relaxed whitespace-pre-line text-foreground">
            {mission.description}
          </p>

          <dl className="m-0 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">{t("placesLabel")}</dt>
              <dd className="m-0 text-muted-foreground">
                {t("places", { accepted: mission.acceptedCount, places: mission.places })}
              </dd>
            </div>
            {mission.compensation ?
              <div>
                <dt className="font-medium text-foreground">{t("compensationLabel")}</dt>
                <dd className="m-0 text-muted-foreground">{mission.compensation}</dd>
              </div>
            : null}
            {mission.startsAt || mission.endsAt ?
              <div>
                <dt className="font-medium text-foreground">{t("datesLabel")}</dt>
                <dd className="m-0 text-muted-foreground">
                  {[mission.startsAt, mission.endsAt]
                    .map((date) => (date ? formatDate(date, locale) : "…"))
                    .join(" → ")}
                </dd>
              </div>
            : null}
            {mission.githubRepoUrl ?
              <div>
                <dt className="font-medium text-foreground">{t("repoLabel")}</dt>
                <dd className="m-0">
                  <a
                    href={mission.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-primary hover:underline"
                    data-testid="mission-repo-link"
                  >
                    {mission.githubRepoUrl.replace(/^https:\/\/github\.com\//, "")}
                  </a>
                </dd>
              </div>
            : null}
          </dl>

          {mission.skills.length > 0 ?
            <div className="flex flex-wrap gap-1">
              {mission.skills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.label}
                </Badge>
              ))}
            </div>
          : null}

          <div className="border-t border-border pt-4">
            <MissionApplyPanel mission={mission} viewerId={viewerId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
