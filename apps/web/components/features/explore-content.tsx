import type { Subject } from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { SubjectIcon } from "@/components/features/subject-icon";
import { SubjectRequestExploreCard } from "@/components/features/subject-request-explore-card";
import { Link } from "@/i18n/navigation";

type Props = {
  subjects: Subject[];
  error: string | null;
};

export async function ExploreContent({ subjects, error }: Props) {
  const t = await getTranslations("explore");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <header className="mb-8">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {tCommon("brand")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          {t("description")}
        </p>
      </header>

      {error ? (
        <Alert variant="destructive" data-testid="explore-ssr-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!error && subjects.length === 0 ? (
        <section aria-label={t("sectionAria")}>
          <Card className="mb-6" data-testid="explore-empty">
            <CardHeader>
              <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
              <CardDescription>{t("emptyDescription")}</CardDescription>
            </CardHeader>
          </Card>
          <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
            <SubjectRequestExploreCard />
          </ul>
        </section>
      ) : null}

      {!error && subjects.length > 0 ? (
        <section aria-label={t("sectionAria")}>
          <ul
            className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3"
            data-testid="explore-subject-grid"
          >
            {subjects.map((subject) => (
              <li key={subject.id} data-testid={`explore-subject-${subject.slug}`}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <Link
                    href={`/subjects/${subject.slug}`}
                    className="flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("cardLinkAria", { name: subject.name })}
                  >
                    <CardHeader className="gap-4">
                      <SubjectIcon
                        icon={subject.icon}
                        accentColor={subject.accentColor}
                        name={subject.name}
                      />
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{subject.name}</CardTitle>
                        {subject.description ? (
                          <CardDescription className="line-clamp-3 text-sm">
                            {subject.description}
                          </CardDescription>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center justify-between pt-0 text-sm text-muted-foreground">
                      <span>
                        {t("postsCount", { count: subject.postsCount })}
                      </span>
                      <span
                        className="text-primary transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        →
                      </span>
                    </CardContent>
                  </Link>
                </Card>
              </li>
            ))}
            <SubjectRequestExploreCard />
          </ul>
        </section>
      ) : null}
    </div>
  );
}
