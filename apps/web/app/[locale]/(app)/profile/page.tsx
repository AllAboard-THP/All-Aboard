import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { ProfileContent } from "@/components/features/profile-content";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { fetchAuthMe, fetchSubjects } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const tFeed = await getTranslations("feed");
  const locale = (await getLocale()) as AppLocale;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="profile-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link href="/login?returnTo=%2Fprofile" className="text-primary underline">
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const [meResult, subjectsResult] = await Promise.all([
    fetchAuthMe(token),
    fetchSubjects(),
  ]);

  if (!meResult.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="profile-load-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{meResult.error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/">{tFeed("backToFeed")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProfileContent
      profile={meResult.data}
      subjects={subjectsResult.ok ? subjectsResult.data.items : []}
      locale={locale}
    />
  );
}
