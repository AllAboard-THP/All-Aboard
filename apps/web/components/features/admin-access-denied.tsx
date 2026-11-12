import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { Link } from "@/i18n/navigation";
import type { AdminSessionDeniedReason } from "@/lib/require-admin-session";

type Props = {
  reason: AdminSessionDeniedReason;
};

export async function AdminAccessDenied({ reason }: Props) {
  const t = await getTranslations("admin");
  const tFeed = await getTranslations("feed");

  if (reason === "unauthenticated") {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="admin-unauthenticated">
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

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Alert variant="destructive" data-testid="admin-forbidden">
        <AlertTitle>{t("forbiddenTitle")}</AlertTitle>
        <AlertDescription>{t("forbiddenDescription")}</AlertDescription>
      </Alert>
      <div className="mt-4">
        <Button variant="outline" asChild>
          <Link href="/feed">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
