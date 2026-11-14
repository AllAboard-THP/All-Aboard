import type {
  HelpRequest,
  MentorDashboardResponse,
  MentorFeedResponse,
  Resource,
} from "@allaboard/types";
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
import { cn } from "@allaboard/ui/lib/utils";

import { MentorResourceReviewActions } from "@/components/features/mentor-resource-review-actions";
import { ResourceCard } from "@/components/features/resource-card";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  userId: string;
  dashboard: MentorDashboardResponse | null;
  dashboardError: string | null;
  feed: MentorFeedResponse | null;
  feedError: string | null;
};

function truncateBody(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function StatCard({
  value,
  label,
  highlight,
  testId,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  testId: string;
}) {
  return (
    <Card
      data-testid={testId}
      className={cn("text-center", highlight && "ring-1 ring-primary/40")}
    >
      <CardHeader className="pb-2">
        <p
          className={cn(
            "m-0 text-3xl font-bold tabular-nums",
            highlight ? "text-primary" : "text-muted-foreground",
          )}
        >
          {value}
        </p>
        <CardDescription className="text-xs">{label}</CardDescription>
      </CardHeader>
    </Card>
  );
}

async function PendingResourceRow({
  resource,
  locale,
}: {
  resource: Resource;
  locale: AppLocale;
}) {
  const tCommon = await getTranslations("common");
  return (
    <div
      className="border-b border-border p-5 last:border-b-0"
      data-testid="mentor-pending-resource"
    >
      <h3 className="mb-1 text-base font-semibold">{resource.title}</h3>
      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
        {truncateBody(resource.body, 200)}
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={`/users/${resource.authorId}`}
          className="font-medium text-primary hover:underline"
        >
          {tCommon("author", { authorId: resource.authorId })}
        </Link>
        {resource.subject ? (
          <Badge
            variant="outline"
            style={{
              borderColor: `${resource.subject.accentColor}66`,
              color: resource.subject.accentColor,
              backgroundColor: `${resource.subject.accentColor}18`,
            }}
          >
            {resource.subject.name}
          </Badge>
        ) : null}
        {resource.tags?.map((tag) => (
          <Badge key={tag} variant="outline" className="text-muted-foreground">
            #{tag}
          </Badge>
        ))}
        <span className="ml-auto">
          {formatDateTime(resource.createdAt, locale)}
        </span>
      </div>
      <MentorResourceReviewActions resourceId={resource.id} />
    </div>
  );
}

async function HelpQueueRow({
  item,
  locale,
  helpCta,
}: {
  item: HelpRequest;
  locale: AppLocale;
  helpCta: string;
}) {
  const tCommon = await getTranslations("common");

  return (
    <div
      className="flex flex-wrap items-start gap-4 border-b border-border p-5 last:border-b-0"
      data-testid="mentor-help-queue-item"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            {tCommon("author", { authorId: item.authorId })}
          </span>
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
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDateTime(item.createdAt, locale)}
          </span>
        </div>
        <p className="mb-1 text-sm font-medium">{item.title}</p>
        {item.body ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {truncateBody(item.body, 150)}
          </p>
        ) : null}
      </div>
      <Button size="sm" variant="outline" asChild className="shrink-0">
        <Link href={`/requests/${item.id}`}>{helpCta}</Link>
      </Button>
    </div>
  );
}

export async function MentorDashboardContent({
  userId,
  dashboard,
  dashboardError,
  feed,
  feedError,
}: Props) {
  const t = await getTranslations("mentor");
  const tFeed = await getTranslations("feed");
  const tCommon = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const stats = dashboard?.stats;
  const pendingCount = stats?.pendingResourcesCount ?? 0;
  const helpCount = stats?.helpMentorQueueCount ?? 0;
  const publishedCount = stats?.myResourcesCount ?? 0;

  const feedItems = feed?.items ?? [];
  const unreadCount = feedItems.filter((item) => item.hasUnreadForMentor).length;

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-8">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {t("dashboardTitle")}
        </h1>
        <p className="m-0 text-muted-foreground">{t("dashboardDescription")}</p>
        <p className="mt-2 m-0 text-sm text-muted-foreground">
          {t("connectedAs", {
            userId,
            unreadSuffix:
              unreadCount > 0 ?
                t("unreadSuffix", { count: unreadCount })
              : "",
          })}
        </p>
      </header>

      {dashboardError ? (
        <Alert variant="destructive" className="mb-6" data-testid="mentor-dashboard-error">
          <AlertTitle>{t("dashboardLoadErrorTitle")}</AlertTitle>
          <AlertDescription>{dashboardError}</AlertDescription>
        </Alert>
      ) : null}

      {stats ? (
        <div
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          data-testid="mentor-stats-grid"
        >
          <StatCard
            testId="mentor-stat-published"
            value={publishedCount}
            label={t("statsPublished", { count: publishedCount })}
          />
          <StatCard
            testId="mentor-stat-pending"
            value={pendingCount}
            label={t("statsPending")}
            highlight={pendingCount > 0}
          />
          <StatCard
            testId="mentor-stat-help"
            value={helpCount}
            label={t("statsHelpQueue")}
            highlight={helpCount > 0}
          />
        </div>
      ) : null}

      {pendingCount > 0 || helpCount > 0 ? (
        <p className="mb-6 text-sm font-medium text-primary" data-testid="mentor-action-required">
          {t("actionRequired")}
        </p>
      ) : null}

      {dashboard ? (
        <>
          <Card className="mb-6" data-testid="mentor-help-queue-panel">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{t("helpQueueTitle")}</CardTitle>
                {helpCount > 0 ? (
                  <Badge variant="destructive">{helpCount}</Badge>
                ) : null}
              </div>
            </CardHeader>
            {dashboard.helpMentorQueue.length > 0 ? (
              <CardContent className="p-0">
                {dashboard.helpMentorQueue.map((item) => (
                  <HelpQueueRow
                    key={item.id}
                    item={item}
                    locale={locale}
                    helpCta={t("helpQueueHelpCta")}
                  />
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <p className="m-0 text-center text-sm text-muted-foreground">
                  {t("helpQueueEmpty")}
                </p>
              </CardContent>
            )}
          </Card>

          <Card className="mb-6" data-testid="mentor-pending-panel">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{t("pendingTitle")}</CardTitle>
                {pendingCount > 0 ? (
                  <Badge variant="secondary">{pendingCount}</Badge>
                ) : null}
              </div>
            </CardHeader>
            {dashboard.pendingResources.length > 0 ? (
              <CardContent className="p-0">
                {dashboard.pendingResources.map((resource) => (
                  <PendingResourceRow
                    key={resource.id}
                    resource={resource}
                    locale={locale}
                  />
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <p className="m-0 text-center text-sm text-muted-foreground">
                  {t("pendingEmpty")}
                </p>
              </CardContent>
            )}
          </Card>

          <section className="mb-8" aria-label={t("myResourcesTitle")}>
            <h2 className="mb-4 text-xl font-semibold">{t("myResourcesTitle")}</h2>
            {dashboard.myResources.length > 0 ? (
              <ul
                className="flex list-none flex-col gap-4 p-0"
                data-testid="mentor-my-resources-list"
              >
                {dashboard.myResources.map((resource) => (
                  <li key={resource.id}>
                    <ResourceCard resource={resource} locale={locale} />
                  </li>
                ))}
              </ul>
            ) : (
              <Card data-testid="mentor-my-resources-empty">
                <CardHeader>
                  <CardDescription>{t("myResourcesEmpty")}</CardDescription>
                </CardHeader>
              </Card>
            )}
          </section>
        </>
      ) : null}

      <section className="mb-6" aria-label={t("feedSectionTitle")}>
        <h2 className="mb-1 text-xl font-semibold">{t("feedSectionTitle")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t("feedSectionDescription")}
        </p>

        {feedItems.length === 0 && !feedError ? (
          <Card data-testid="mentor-feed-empty">
            <CardHeader>
              <CardTitle className="text-lg">{t("emptyTitle")}</CardTitle>
              <CardDescription>{t("emptyDescription")}</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {feedError ? (
          <Alert variant="destructive" data-testid="mentor-feed-error">
            <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
            <AlertDescription>{feedError}</AlertDescription>
          </Alert>
        ) : null}

        {feedItems.length > 0 ? (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="mentor-feed-list"
          >
            {feedItems.map((item) => (
              <li key={item.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/requests/${item.id}`}
                          className="text-foreground hover:text-primary hover:underline"
                        >
                          {item.title}
                        </Link>
                      </CardTitle>
                      {item.hasUnreadForMentor ? (
                        <Badge
                          variant="destructive"
                          data-testid="mentor-notification-badge"
                        >
                          {t("newResponseBadge")}
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        {tCommon("author", { authorId: item.authorId })}
                      </span>
                      <span>{formatDateTime(item.createdAt, locale)}</span>
                      {item.responseCount > 0 ? (
                        <span>
                          {t("responseCount", { count: item.responseCount })}
                          {item.lastResponseAt ?
                            t("lastResponse", {
                              date: formatDateTime(item.lastResponseAt, locale),
                            })
                          : null}
                        </span>
                      ) : (
                        <span>{t("noResponses")}</span>
                      )}
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
      </section>

      <Button variant="outline" asChild>
        <Link href="/">{tFeed("backToFeed")}</Link>
      </Button>
    </div>
  );
}
