import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { MentorDashboardContent } from "@/components/features/mentor-dashboard-content";
import { Link } from "@/i18n/navigation";
import {
  fetchAuthMe,
  fetchMentorDashboard,
  fetchMentorFeed,
} from "@/lib/api-server";

export const dynamic = "force-dynamic";

function isMentorRole(role: string): boolean {
  return role === "mentor" || role === "admin";
}

export default async function MentorDashboardPage() {
  const t = await getTranslations("mentor");
  const tFeed = await getTranslations("feed");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="mentor-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link href="/login" className="text-primary underline">
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const meResult = await fetchAuthMe(token);
  if (!meResult.ok || !isMentorRole(meResult.data.role)) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="mentor-forbidden">
          <AlertTitle>{t("forbiddenTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("forbiddenDescription", {
              alice: (chunks) => (
                <code className="text-foreground">{chunks}</code>
              ),
              envVar: (chunks) => (
                <code className="text-foreground">{chunks}</code>
              ),
            })}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">{tFeed("backToFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [dashboardResult, feedResult] = await Promise.all([
    fetchMentorDashboard(token),
    fetchMentorFeed(token),
  ]);

  return (
    <MentorDashboardContent
      userId={meResult.data.userId}
      dashboard={dashboardResult.ok ? dashboardResult.data : null}
      dashboardError={dashboardResult.ok ? null : dashboardResult.error}
      feed={feedResult.ok ? feedResult.data : null}
      feedError={feedResult.ok ? null : feedResult.error}
    />
  );
}
