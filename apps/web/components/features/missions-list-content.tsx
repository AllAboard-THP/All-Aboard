import type { Mission } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import { Alert, AlertDescription, AlertTitle } from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { MissionCard } from "@/components/features/mission-card";
import { Link } from "@/i18n/navigation";
import {
  MISSION_KINDS,
  missionsHref,
  type MissionsPageParams,
} from "@/lib/missions-search-params";

type Props = {
  items: Mission[];
  error: string | null;
  params: MissionsPageParams;
  canPost: boolean;
};

export async function MissionsListContent({ items, error, params, canPost }: Props) {
  const t = await getTranslations("missions");
  const tCommon = await getTranslations("common");

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: t("filterAll"), href: missionsHref({ status: params.status }), active: !params.kind },
    ...MISSION_KINDS.map((kind) => ({
      label: t(`kind.${kind}`),
      href: missionsHref({ ...params, kind }),
      active: params.kind === kind,
    })),
  ];

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {tCommon("brand")}
          </p>
          <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
            {t("title")}
          </h1>
          <p className="m-0 max-w-prose text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/missions">{t("dashboardLink")}</Link>
          </Button>
          {canPost ?
            <Button asChild data-testid="missions-new-cta">
              <Link href="/missions/new">{t("newCta")}</Link>
            </Button>
          : null}
        </div>
      </header>

      <nav aria-label={t("filtersAria")} className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.href}
            size="sm"
            variant={filter.active ? "default" : "outline"}
            asChild
          >
            <Link href={filter.href}>{filter.label}</Link>
          </Button>
        ))}
        <Button size="sm" variant="ghost" asChild>
          <Link
            href={missionsHref({
              ...params,
              status: params.status === "completed" ? undefined : "completed",
            })}
          >
            {params.status === "completed" ? t("showCurrent") : t("showCompleted")}
          </Link>
        </Button>
      </nav>

      {error ?
        <Alert variant="destructive" data-testid="missions-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      : null}

      {!error && items.length === 0 ?
        <Card data-testid="missions-empty">
          <CardHeader>
            <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
            <CardDescription>
              {canPost ? t("emptyDescriptionMentor") : t("emptyDescription")}
            </CardDescription>
          </CardHeader>
        </Card>
      : null}

      {!error && items.length > 0 ?
        <ul className="m-0 flex list-none flex-col gap-4 p-0" data-testid="missions-list">
          {items.map((mission) => (
            <li key={mission.id}>
              <MissionCard mission={mission} />
            </li>
          ))}
        </ul>
      : null}
    </div>
  );
}
