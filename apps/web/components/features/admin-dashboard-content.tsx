import type { AdminDashboardResponse } from "@allaboard/types";
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

import { AdminPageShell } from "@/components/features/admin-page-shell";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  dashboard: AdminDashboardResponse | null;
  error: string | null;
};

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

function truncateBody(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export async function AdminDashboardContent({ dashboard, error }: Props) {
  const t = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;
  const stats = dashboard?.stats;

  const quickLinks = [
    {
      href: "/admin/moderation" as const,
      label: t("nav.moderation"),
      count: stats?.flaggedCount ?? 0,
      testId: "admin-quick-moderation",
    },
    {
      href: "/admin/denylist-patterns" as const,
      label: t("nav.denylist"),
      count: 0,
      testId: "admin-quick-denylist",
    },
    {
      href: "/admin/users" as const,
      label: t("nav.users"),
      count: stats?.totalUsers ?? 0,
      testId: "admin-quick-users",
    },
    {
      href: "/admin/subject-requests" as const,
      label: t("nav.subjectRequests"),
      count: stats?.pendingSubjectRequests ?? 0,
      testId: "admin-quick-subject-requests",
    },
  ];

  return (
    <AdminPageShell testId="admin-dashboard-page">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("dashboardTitle")}</h1>
        <p className="m-0 text-muted-foreground">{t("dashboardDescription")}</p>
      </header>

      {error ? (
        <Alert variant="destructive" className="mb-6" data-testid="admin-dashboard-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {stats ? (
        <div
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
          data-testid="admin-stats-grid"
        >
          <StatCard
            testId="admin-stat-users"
            value={stats.totalUsers}
            label={t("statsUsers")}
          />
          <StatCard
            testId="admin-stat-help-requests"
            value={stats.totalHelpRequests}
            label={t("statsHelpRequests")}
          />
          <StatCard
            testId="admin-stat-flagged"
            value={stats.flaggedCount}
            label={t("statsFlagged")}
            highlight={stats.flaggedCount > 0}
          />
          <StatCard
            testId="admin-stat-subject-requests"
            value={stats.pendingSubjectRequests}
            label={t("statsSubjectRequests")}
            highlight={stats.pendingSubjectRequests > 0}
          />
          <StatCard
            testId="admin-stat-pending-resources"
            value={stats.pendingResources}
            label={t("statsPendingResources")}
            highlight={stats.pendingResources > 0}
          />
        </div>
      ) : null}

      <Card className="mb-8" data-testid="admin-quick-links">
        <CardHeader>
          <CardTitle className="text-lg">{t("quickLinksTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Button key={link.href} variant="outline" size="sm" asChild>
              <Link href={link.href} data-testid={link.testId}>
                {link.label}
                {link.count > 0 && link.href !== "/admin/denylist-patterns" ? (
                  <Badge variant="secondary" className="ml-2">
                    {link.count}
                  </Badge>
                ) : null}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {dashboard ? (
        <Card data-testid="admin-recent-requests">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">{t("recentRequestsTitle")}</CardTitle>
          </CardHeader>
          {dashboard.recentHelpRequests.length > 0 ? (
            <CardContent className="p-0">
              {dashboard.recentHelpRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-start gap-4 border-b border-border p-5 last:border-b-0"
                  data-testid="admin-recent-request-row"
                >
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-semibold">{item.title}</p>
                    {item.body ? (
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                        {truncateBody(item.body)}
                      </p>
                    ) : null}
                    <p className="m-0 text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt, locale)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild className="shrink-0">
                    <Link href={`/requests/${item.id}`}>{t("viewRequest")}</Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent>
              <p className="m-0 text-center text-sm text-muted-foreground">
                {t("recentRequestsEmpty")}
              </p>
            </CardContent>
          )}
        </Card>
      ) : null}
    </AdminPageShell>
  );
}
