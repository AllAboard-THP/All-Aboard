import { cookies } from "next/headers";
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

import { Link } from "@/i18n/navigation";
import { fetchAuthMe, fetchMentorFeed } from "@/lib/api-server";
import { formatDateTime } from "@/lib/format-datetime";
import { mapApiErrorToKey } from "@/lib/map-api-error";

export const dynamic = "force-dynamic";

export default async function MentorDashboardPage() {
  const locale = await getLocale();
  const t = await getTranslations("mentor");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const tErrors = await getTranslations("errors");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="mentor-unauthenticated">
          <AlertTitle>{t("unauthenticatedTitle")}</AlertTitle>
          <AlertDescription>
            {t("unauthenticatedDescriptionBefore")}{" "}
            <Link href="/help/new" className="text-primary underline">
              {tNav("newRequest")}
            </Link>{" "}
            {t("unauthenticatedDescriptionAfter")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const meResult = await fetchAuthMe(token);
  if (!meResult.ok || meResult.data.role !== "mentor") {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="mentor-forbidden">
          <AlertTitle>{t("forbiddenTitle")}</AlertTitle>
          <AlertDescription>{t("forbiddenDescription")}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">{tCommon("backToFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const feedResult = await fetchMentorFeed();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="m-0 text-muted-foreground">
          {t("connectedAs", { userId: meResult.data.userId })}
        </p>
      </header>

      {feedResult.ok && feedResult.data.items.length === 0 ? (
        <Card data-testid="mentor-feed-empty">
          <CardHeader>
            <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
            <CardDescription>{t("emptyDescription")}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!feedResult.ok ? (
        <Alert variant="destructive" data-testid="mentor-feed-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>
            {tErrors(mapApiErrorToKey(feedResult.error))}
          </AlertDescription>
        </Alert>
      ) : null}

      {feedResult.ok && feedResult.data.items.length > 0 ? (
        <ul
          className="flex list-none flex-col gap-3 p-0"
          data-testid="mentor-feed-list"
        >
          {feedResult.data.items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    <Link
                      href={`/requests/${item.id}`}
                      className="text-foreground hover:text-primary hover:underline"
                    >
                      {item.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
                    <span>{tCommon("author", { authorId: item.authorId })}</span>
                    <span>{formatDateTime(item.createdAt, locale)}</span>
                  </CardDescription>
                </CardHeader>
                {item.tags && item.tags.length > 0 ? (
                  <CardContent className="pt-0">
                    <p className="m-0 text-xs text-muted-foreground">
                      {tCommon("tags", { tags: item.tags.join(", ") })}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6">
        <Button variant="outline" asChild>
          <Link href="/">{tCommon("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
