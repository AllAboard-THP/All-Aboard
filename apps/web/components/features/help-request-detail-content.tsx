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
import { PostSocialActions } from "@/components/features/post-social-actions";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

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
  const t = await getTranslations("helpRequest");
  const tFeed = await getTranslations("feed");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

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
              <Link href="/">{tFeed("backToFeed")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="help-request-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>
            {detailError ?? tCommon("unknownError")}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">{tFeed("backToFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item } = detail;

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

      <PostSocialActions
        helpRequestId={id}
        initialLikesCount={item.likesCount ?? 0}
        loginReturnPath={`/requests/${id}`}
        className="mb-6"
      />

      <HelpRequestDetailClient initialDetail={detail} requestId={id} />

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
