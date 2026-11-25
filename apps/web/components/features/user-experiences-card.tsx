import type { ExperienceCertification } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDate } from "@/lib/format-datetime";
import { certificationProofUrl } from "@/lib/intuition-proof";

type Props = {
  items: ExperienceCertification[];
  isOwnProfile: boolean;
};

/** Profile "Experience" card: missions validated by their author (ADR 0010). */
export async function UserExperiencesCard({ items, isOwnProfile }: Props) {
  const t = await getTranslations("profile.public.experiences");
  const tMissions = await getTranslations("missions");
  const locale = (await getLocale()) as AppLocale;
  const hasProof = items.some((item) => Boolean(item.proof));

  return (
    <Card className="mb-6" data-testid="user-experiences">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.length === 0 ?
          <p className="m-0 text-sm text-muted-foreground">
            {isOwnProfile ? t("emptyOwn") : t("empty")}
          </p>
        : <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {items.map((item) => {
              const proofUrl = item.proof ? certificationProofUrl(item.proof) : null;
              return (
                <li
                  key={item.id}
                  className="border-l border-border pl-3"
                  data-testid="experience-item"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/missions/${item.mission.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {item.mission.title}
                    </Link>
                    <Badge variant="secondary">{tMissions(`kind.${item.mission.kind}`)}</Badge>
                  </div>
                  <p className="mt-1 mb-0 text-sm text-muted-foreground">
                    {t.rich("validatedBy", {
                      date: formatDate(item.createdAt, locale),
                      mentor: () => (
                        <Link
                          href={`/users/${item.attester.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {item.attester.displayName}
                        </Link>
                      ),
                    })}
                  </p>
                  {item.comment ?
                    <p className="mt-1 mb-0 text-sm leading-relaxed text-muted-foreground">
                      {item.comment}
                    </p>
                  : null}
                  <p className="mt-1 mb-0 flex flex-wrap gap-3 text-xs">
                    {item.deliverableUrl ?
                      <a
                        href={item.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {t("deliverable")}
                      </a>
                    : null}
                    {item.proof ?
                      proofUrl ?
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          data-testid="experience-proof-link"
                        >
                          {t("proofLink")}
                        </a>
                      : <span className="text-muted-foreground">{t("proofPublished")}</span>
                    : null}
                  </p>
                </li>
              );
            })}
          </ul>
        }
        {hasProof ?
          <p className="m-0 text-xs text-muted-foreground">{t("proofNote")}</p>
        : null}
      </CardContent>
    </Card>
  );
}
