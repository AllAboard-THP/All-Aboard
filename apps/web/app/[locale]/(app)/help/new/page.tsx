import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { HelpRequestForm } from "@/components/features/help-request-form";
import { MarketingPageShell } from "@/components/features/marketing-page-shell";
import { Link } from "@/i18n/navigation";

export default async function NewHelpRequestPage() {
  const t = await getTranslations("helpNew");

  return (
    <MarketingPageShell maxWidth="narrow">
      <Card>
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {t("eyebrow")}
          </p>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}{" "}
            <code className="text-foreground">/api/help-requests</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HelpRequestForm />
          <p className="mt-5">
            <Link
              href="/feed"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("backHome")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </MarketingPageShell>
  );
}
