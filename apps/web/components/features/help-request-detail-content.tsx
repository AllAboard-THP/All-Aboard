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
import { Badge } from "@allaboard/ui/components/badge";
import { PostCardCodeBlock } from "@allaboard/ui/patterns/post-card";

import { HelpRequestDetailClient } from "@/components/features/help-request-detail-client";
import { HelpRequestAiSummary } from "@/components/features/help-request-ai-summary";
import { AuthorProfileLink } from "@/components/features/author-profile-link";
import { HelpRequestOwnerActions } from "@/components/features/help-request-owner-actions";
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
  const tForm = await getTranslations("helpForm");
  const tProfile = await getTranslations("profile");
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
              <Link href="/feed">{tFeed("backToFeed")}</Link>
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
            <Link href="/feed">{tFeed("backToFeed")}</Link>
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
          <span className="inline-flex flex-wrap items-center gap-x-1">
            <span>{tCommon("authorLabel")}</span>
            <AuthorProfileLink
              authorId={item.authorId}
              authorProfileId={item.authorProfileId}
            >
              {item.authorId}
            </AuthorProfileLink>
          </span>
          <span>{formatDateTime(item.createdAt, locale)}</span>
        </CardDescription>
        {item.tags && item.tags.length > 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {tCommon("tags", { tags: item.tags.join(", ") })}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {item.subject ? (
            <Badge variant="outline">{item.subject.name}</Badge>
          ) : null}
          {item.urgent ? (
            <Badge variant="destructive">{tForm("urgent")}</Badge>
          ) : null}
          {item.status === "resolved" ? (
            <Badge variant="secondary">{t("statusResolved")}</Badge>
          ) : null}
          {item.educationLevel ? (
            <span className="text-sm text-muted-foreground">
              {tProfile("educationLevel")}: {item.educationLevel}
            </span>
          ) : null}
        </div>
      </header>

      {item.body?.trim() ? (
        <section className="mb-6" data-testid="help-request-body">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            {tForm("body")}
          </h2>
          <p className="m-0 whitespace-pre-wrap text-sm text-foreground">
            {item.body}
          </p>
        </section>
      ) : null}

      {item.codeSnippet?.trim() ? (
        <section className="mb-6" data-testid="help-request-code">
          <PostCardCodeBlock
            language={item.codeLanguage ?? "plaintext"}
            snippet={item.codeSnippet}
            copyLabel={t("copyCode")}
          />
        </section>
      ) : null}

      <HelpRequestAiSummary
        requestId={id}
        status={item.status}
        initialAiSummary={item.aiSummary}
      />

      <PostSocialActions
        helpRequestId={id}
        initialLikesCount={item.likesCount ?? 0}
        loginReturnPath={`/requests/${id}`}
        className="mb-6"
      />

      <HelpRequestOwnerActions
        requestId={id}
        authorId={item.authorId}
        status={item.status}
        mentorHelpRequested={item.mentorHelpRequested}
      />

      <HelpRequestDetailClient initialDetail={detail} requestId={id} />

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/feed">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
