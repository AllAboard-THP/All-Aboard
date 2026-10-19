import type { AdminModerationResponse } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Badge } from "@allaboard/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { AdminModerationActions } from "@/components/features/admin-moderation-actions";
import { AdminPageShell } from "@/components/features/admin-page-shell";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  moderation: AdminModerationResponse | null;
  error: string | null;
};

function truncateBody(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export async function AdminModerationContent({ moderation, error }: Props) {
  const t = await getTranslations("admin.moderation");
  const tAdmin = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;

  const helpRequests = moderation?.flaggedHelpRequests ?? [];
  const responses = moderation?.flaggedResponses ?? [];
  const total = helpRequests.length + responses.length;

  return (
    <AdminPageShell testId="admin-moderation-page">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="m-0 text-muted-foreground">{t("description", { count: total })}</p>
      </header>

      {error ? (
        <Alert variant="destructive" className="mb-6" data-testid="admin-moderation-error">
          <AlertTitle>{tAdmin("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {moderation ? (
        <>
          <Card className="mb-6" data-testid="admin-flagged-help-requests">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{t("helpRequestsTitle")}</CardTitle>
                {helpRequests.length > 0 ? (
                  <Badge variant="destructive">{helpRequests.length}</Badge>
                ) : null}
              </div>
            </CardHeader>
            {helpRequests.length > 0 ? (
              <CardContent className="p-0">
                {helpRequests.map((item) => (
                  <div
                    key={item.id}
                    className="border-b border-border p-5 last:border-b-0"
                    data-testid="admin-flagged-help-request"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{t("pendingBadge")}</Badge>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt, locale)}
                      </span>
                    </div>
                    <p className="mb-1 font-semibold">
                      <Link
                        href={`/requests/${item.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {item.title}
                      </Link>
                    </p>
                    {item.body ? (
                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                        {truncateBody(item.body)}
                      </p>
                    ) : null}
                    <AdminModerationActions kind="help-request" itemId={item.id} />
                  </div>
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <CardDescription>{t("helpRequestsEmpty")}</CardDescription>
              </CardContent>
            )}
          </Card>

          <Card data-testid="admin-flagged-responses">
            <CardHeader className="border-b border-border">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{t("responsesTitle")}</CardTitle>
                {responses.length > 0 ? (
                  <Badge variant="destructive">{responses.length}</Badge>
                ) : null}
              </div>
            </CardHeader>
            {responses.length > 0 ? (
              <CardContent className="p-0">
                {responses.map(({ item, helpRequest }) => (
                  <div
                    key={item.id}
                    className="border-b border-border p-5 last:border-b-0"
                    data-testid="admin-flagged-response"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{t("pendingBadge")}</Badge>
                      {item.createdAt ? (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {formatDateTime(item.createdAt, locale)}
                        </span>
                      ) : null}
                    </div>
                    {helpRequest ? (
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t("responseTo")}{" "}
                        <Link
                          href={`/requests/${helpRequest.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {helpRequest.title}
                        </Link>
                      </p>
                    ) : null}
                    <p className="mb-4 text-sm text-muted-foreground">
                      {truncateBody(item.body)}
                    </p>
                    <AdminModerationActions kind="response" itemId={item.id} />
                  </div>
                ))}
              </CardContent>
            ) : (
              <CardContent>
                <CardDescription>{t("responsesEmpty")}</CardDescription>
              </CardContent>
            )}
          </Card>
        </>
      ) : null}
    </AdminPageShell>
  );
}
