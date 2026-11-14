import { MentorDashboardDemo } from "@/components/features/mentor-dashboard-demo";
import { initPageLocale } from "@/lib/init-page-locale";

type PageProps = { params: Promise<{ locale: string }> };

/** Mentor dashboard demo — chrome from AppShell sidebar + header. */
export default async function MentorDashboardDemoPage({ params }: PageProps) {
  const { locale } = await params;
  initPageLocale(locale);
  return <MentorDashboardDemo />;
}
