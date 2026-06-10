import { StudentDashboardDemo } from "@/components/features/student-dashboard-demo";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

/** Student dashboard demo — chrome from AppShell sidebar + header. */
export default async function StudentDashboardDemoPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <StudentDashboardDemo />;
}
