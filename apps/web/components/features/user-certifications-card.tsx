import type {
  CertificationEligibilityResponse,
  Skill,
  SkillCertificationGroup,
} from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { CertificationWithdrawButton } from "@/components/features/certification-withdraw-button";
import { SkillCertificationForm } from "@/components/features/skill-certification-form";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

export type UserCertificationsData = {
  groups: SkillCertificationGroup[];
  /** Null when the viewer is signed out or looks at their own profile. */
  eligibility: CertificationEligibilityResponse | null;
  skills: Skill[];
};

type Props = {
  userId: string;
  displayName: string;
  viewerId?: string | null;
  data: UserCertificationsData;
};

export async function UserCertificationsCard({
  userId,
  displayName,
  viewerId,
  data,
}: Props) {
  const t = await getTranslations("profile.public.certifications");
  const locale = (await getLocale()) as AppLocale;
  const { groups, eligibility } = data;
  const attested = new Set(eligibility?.attestedSkillIds ?? []);
  const remainingSkills = data.skills.filter((skill) => !attested.has(skill.id));
  const isOwnProfile = Boolean(viewerId) && viewerId === userId;

  return (
    <Card className="mb-6" data-testid="user-certifications">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {groups.length === 0 ?
          <p className="m-0 text-sm text-muted-foreground">
            {isOwnProfile ? t("emptyOwn") : t("empty")}
          </p>
        : <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {groups.map((group) => (
              <li key={group.skill.id} data-testid="certification-group">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">{group.skill.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {t("count", { count: group.count })}
                  </span>
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0 pl-2">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-l border-border pl-3"
                    >
                      <div className="min-w-0">
                        <p className="m-0 text-sm">
                          <Link
                            href={`/users/${item.attester.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {item.attester.displayName}
                          </Link>{" "}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(item.createdAt, locale)}
                          </span>
                        </p>
                        {item.comment ?
                          <p className="mt-1 mb-0 text-sm leading-relaxed text-muted-foreground">
                            {item.comment}
                          </p>
                        : null}
                      </div>
                      {viewerId && item.attester.id === viewerId ?
                        <CertificationWithdrawButton
                          recipientId={userId}
                          certificationId={item.id}
                        />
                      : null}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        }

        {eligibility ?
          eligibility.eligible ?
            <SkillCertificationForm
              recipientId={userId}
              recipientName={displayName}
              skills={remainingSkills}
            />
          : <p
              className="m-0 text-sm text-muted-foreground"
              data-testid="certification-not-eligible"
            >
              {t("notEligible", { name: displayName })}
            </p>
        : null}
      </CardContent>
    </Card>
  );
}
