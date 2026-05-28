import type { HelpRequestDetailResponse } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { HelpRequestDetailClient } from "@/components/features/help-request-detail-client";
import { Link } from "@/i18n/navigation";
import { formatDateTime } from "@/lib/format-datetime";
import { mapApiErrorToKey } from "@/lib/map-api-error";

type Props = {
  id: string;
  detail: HelpRequestDetailResponse | null;
  detailError: string | null;
  notFound: boolean;
};

export async function HelpRequestDetailContent({
  id,
  detail,
  detailError,
  notFound,
}: Props) {
  const locale = await getLocale();
  const t = await getTranslations("detail");
  const tCommon = await getTranslations("common");
  const tErrors = await getTranslations("errors");

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card data-testid="help-request-not-found">
          <CardHeader>
            <CardTitle className="text-2xl">{t("notFoundTitle")}</CardTitle>
            <CardDescription>
              {t("notFoundDescription", { id })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/">{tCommon("backToFeed")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (detailError || !detail) {
    const errorKey = mapApiErrorToKey(detailError);
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="help-request-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">{tCommon("backToFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item, responses = [] } = detail;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {item.title}
        </h1>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1 text-base">
          <span>{tCommon("author", { authorId: item.authorId })}</span>
          <span>{formatDateTime(item.createdAt, locale)}</span>
        </CardDescription>
        {item.tags && item.tags.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {tCommon("tags", { tags: item.tags.join(", ") })}
          </p>
        ) : null}
      </header>

      <section aria-label={t("responsesSectionAriaLabel")} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          {t("responsesTitle")}
        </h2>
        {responses.length === 0 ? (
          <Card data-testid="responses-empty">
            <CardHeader>
              <CardTitle className="text-base">
                {t("responsesEmptyTitle")}
              </CardTitle>
              <CardDescription>
                {t("responsesEmptyDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="flex list-none flex-col gap-3 p-0">
            {responses.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="pt-6">
                    <p className="m-0 text-sm text-foreground">{r.body}</p>
                    <p className="mt-2 mb-0 text-xs text-muted-foreground">
                      {r.authorId}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HelpRequestDetailClient initialDetail={detail} requestId={id} />

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{tCommon("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
