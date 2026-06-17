import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import {
  studentDashboardFixtureEmptyEn,
  studentDashboardFixtureEmptyFr,
} from "@allaboard/ui/patterns/fixtures/student-dashboard";

import { StudentDashboardContent } from "@/components/features/student-dashboard-content";
import { initPageLocale } from "@/lib/init-page-locale";
import type { AppLocale } from "@/i18n/routing";
import { loadStudentDashboard } from "@/lib/load-student-dashboard";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ locale: string }> };

/** Student dashboard — inbox view; chrome from AppShell sidebar + header. */
export default async function StudentDashboardPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  initPageLocale(localeParam);
  const locale = (await getLocale()) as AppLocale;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const emptyFixture =
    locale === "en" ? studentDashboardFixtureEmptyEn : studentDashboardFixtureEmptyFr;

  if (!token) {
    return (
      <StudentDashboardContent fixture={emptyFixture} unauthenticated />
    );
  }

  const result = await loadStudentDashboard(token, locale);

  if (!result.ok) {
    return (
      <StudentDashboardContent
        fixture={emptyFixture}
        loadError={result.error}
      />
    );
  }

  return <StudentDashboardContent fixture={result.fixture} />;
}
