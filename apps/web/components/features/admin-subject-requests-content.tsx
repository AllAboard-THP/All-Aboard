import type { AdminSubjectRequestsResponse } from "@allaboard/types";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";

import { AdminPageShell } from "@/components/features/admin-page-shell";
import { AdminSubjectRequestsPanel } from "@/components/features/admin-subject-requests-panel";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";

type Props = {
  subjectRequests: AdminSubjectRequestsResponse | null;
  error: string | null;
};

export async function AdminSubjectRequestsContent({
  subjectRequests,
  error,
}: Props) {
  const t = await getTranslations("admin.subjectRequests");
  const tAdmin = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;

  return (
    <AdminPageShell testId="admin-subject-requests-page">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="m-0 text-muted-foreground">{t("description")}</p>
      </header>

      {error ? (
        <Alert
          variant="destructive"
          className="mb-6"
          data-testid="admin-subject-requests-error"
        >
          <AlertTitle>{tAdmin("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {subjectRequests ? (
        <AdminSubjectRequestsPanel
          pending={subjectRequests.pending}
          approved={subjectRequests.approved}
          rejected={subjectRequests.rejected}
          localeDateFormatter={(iso) => formatDateTime(iso, locale)}
        />
      ) : null}
    </AdminPageShell>
  );
}
