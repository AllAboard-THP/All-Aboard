import type { DenylistPattern } from "@allaboard/types";
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

import { AdminDenylistCreateForm } from "@/components/features/admin-denylist-create-form";
import { AdminDenylistRowActions } from "@/components/features/admin-denylist-row-actions";
import { AdminPageShell } from "@/components/features/admin-page-shell";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  patterns: DenylistPattern[] | null;
  error: string | null;
};

export async function AdminDenylistContent({ patterns, error }: Props) {
  const t = await getTranslations("admin.denylist");
  const tAdmin = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;
  const items = patterns ?? [];

  return (
    <AdminPageShell testId="admin-denylist-page">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="m-0 text-muted-foreground">{t("description")}</p>
      </header>

      {error ? (
        <Alert variant="destructive" className="mb-6" data-testid="admin-denylist-error">
          <AlertTitle>{tAdmin("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="mb-8" data-testid="admin-denylist-create-card">
        <CardHeader>
          <CardTitle className="text-lg">{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDenylistCreateForm />
        </CardContent>
      </Card>

      <Card data-testid="admin-denylist-list">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        {items.length > 0 ? (
          <CardContent className="p-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="border-b border-border p-5 last:border-b-0"
                data-testid="admin-denylist-row"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="m-0 font-semibold">{item.label}</p>
                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? t("active") : t("inactive")}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDateTime(item.updatedAt, locale)}
                  </span>
                </div>
                <p className="mb-4 font-mono text-sm text-muted-foreground">
                  {item.pattern}
                </p>
                <AdminDenylistRowActions patternId={item.id} active={item.active} />
              </div>
            ))}
          </CardContent>
        ) : (
          <CardContent>
            <CardDescription>{t("empty")}</CardDescription>
          </CardContent>
        )}
      </Card>
    </AdminPageShell>
  );
}
