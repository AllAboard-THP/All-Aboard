import { getTranslations } from "next-intl/server";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminSubjectRequestsPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  const t = await getTranslations("admin.nav");

  return (
    <div className="p-4 sm:p-6" data-testid="admin-subject-requests-page">
      <Card>
        <CardHeader>
          <CardTitle>{t("subjectRequests")}</CardTitle>
          <CardDescription>{t("subjectRequests")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
