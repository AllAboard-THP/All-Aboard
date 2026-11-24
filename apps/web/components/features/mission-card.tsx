import type { Mission } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { Link } from "@/i18n/navigation";

function excerpt(text: string, max = 200): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max).trimEnd()}…`;
}

/** One mission in the `/missions` list. */
export async function MissionCard({ mission }: { mission: Mission }) {
  const t = await getTranslations("missions");

  return (
    <Card className="transition-colors hover:border-primary/50" data-testid="mission-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{t(`kind.${mission.kind}`)}</Badge>
          {mission.status !== "open" ?
            <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
          : null}
          {mission.viewerApplication ?
            <Badge variant="outline" data-testid="mission-card-applied">
              {t(`applicationStatus.${mission.viewerApplication.status}`)}
            </Badge>
          : null}
        </div>
        <CardTitle className="text-lg">
          <Link
            href={`/missions/${mission.id}`}
            className="text-foreground hover:text-primary hover:underline"
          >
            {mission.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {excerpt(mission.description)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0 text-sm text-muted-foreground">
        {mission.skills.length > 0 ?
          <div className="flex flex-wrap gap-1">
            {mission.skills.map((skill) => (
              <Badge key={skill.id} variant="outline">
                {skill.label}
              </Badge>
            ))}
          </div>
        : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={`/users/${mission.author.id}`}
            className="font-medium text-primary hover:underline"
          >
            {mission.author.displayName}
          </Link>
          <span>{t("places", { accepted: mission.acceptedCount, places: mission.places })}</span>
          {mission.compensation ? <span>{mission.compensation}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
