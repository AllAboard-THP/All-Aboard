import type { ResourceDetailResponse } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { ResourceOwnerActions } from "@/components/features/resource-owner-actions";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  id: string;
  detail: ResourceDetailResponse | null;
  detailError: string | null;
  notFound: boolean;
};

export async function ResourceDetailContent({
  id,
  detail,
  detailError,
  notFound,
}: Props) {
  const t = await getTranslations("resources");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  if (notFound) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card data-testid="resource-not-found">
          <CardHeader>
            <CardTitle className="text-2xl">{t("notFoundTitle")}</CardTitle>
            <CardDescription>{t("notFoundDescription", { id })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/resources">{t("backToList")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="resource-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>
            {detailError ?? tCommon("unknownError")}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/resources">{t("backToList")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item } = detail;

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/resources">{t("backToList")}</Link>
        </Button>
        <header>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {t("detailEyebrow")}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="mb-2 text-3xl font-semibold text-foreground">
              {item.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {item.subject ? (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: `${item.subject.accentColor}66`,
                    color: item.subject.accentColor,
                    backgroundColor: `${item.subject.accentColor}18`,
                  }}
                >
                  {item.subject.name}
                </Badge>
              ) : null}
              {item.status === "pending" ? (
                <Badge variant="secondary">{t("statusPending")}</Badge>
              ) : null}
              {item.status === "rejected" ? (
                <Badge variant="destructive">{t("statusRejected")}</Badge>
              ) : null}
              <ResourceOwnerActions
                resourceId={item.id}
                authorId={item.authorId}
              />
            </div>
          </div>
          <CardDescription className="flex flex-wrap gap-x-3 gap-y-1 text-base">
            <Link
              href={`/users/${item.authorId}`}
              className="font-medium text-primary hover:underline"
            >
              {tCommon("author", { authorId: item.authorId })}
            </Link>
            <span>{formatDateTime(item.createdAt, locale)}</span>
          </CardDescription>
          {item.tags && item.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline">#{tag}</Badge>
              ))}
            </div>
          ) : null}
        </header>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="whitespace-pre-wrap text-base leading-relaxed text-foreground"
            data-testid="resource-body"
          >
            {item.body}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
