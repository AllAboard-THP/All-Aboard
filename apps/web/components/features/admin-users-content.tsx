import type { AdminUserSummary } from "@allaboard/types";
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

import { AdminPageShell } from "@/components/features/admin-page-shell";
import { AdminUserRoleActions } from "@/components/features/admin-user-role-actions";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  users: AdminUserSummary[] | null;
  error: string | null;
};

function roleLabel(
  role: AdminUserSummary["role"],
  t: Awaited<ReturnType<typeof getTranslations<"admin.users">>>,
): string {
  if (role === "admin") return t("roleAdmin");
  if (role === "mentor") return t("roleMentor");
  return t("roleStudent");
}

export async function AdminUsersContent({ users, error }: Props) {
  const t = await getTranslations("admin.users");
  const tAdmin = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;
  const items = users ?? [];

  return (
    <AdminPageShell testId="admin-users-page">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="m-0 text-muted-foreground">
          {t("description", { count: items.length })}
        </p>
      </header>

      {error ? (
        <Alert variant="destructive" className="mb-6" data-testid="admin-users-error">
          <AlertTitle>{tAdmin("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card data-testid="admin-users-table">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        {items.length > 0 ? (
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t("columnName")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("columnEmail")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("columnRole")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("columnCreatedAt")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("columnActions")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-b-0"
                    data-testid="admin-user-row"
                  >
                    <td className="px-4 py-3 font-medium">{user.displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === "admin" ? "default"
                          : user.role === "mentor" ?
                            "secondary"
                          : "outline"
                        }
                      >
                        {roleLabel(user.role, t)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(user.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminUserRoleActions userId={user.id} role={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        ) : (
          <CardContent>
            <CardDescription>{t("description", { count: 0 })}</CardDescription>
          </CardContent>
        )}
      </Card>
    </AdminPageShell>
  );
}
