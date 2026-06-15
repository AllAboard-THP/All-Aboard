import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@allaboard/ui/components/card";
import { PasskeyRegisterForm } from "@/components/features/passkey-register-form";
import { MarketingPageShell } from "@/components/features/marketing-page-shell";
import { Link } from "@/i18n/navigation";
import { sanitizeReturnTo } from "@/lib/sanitize-return-to";

type Props = {
  searchParams: Promise<{ returnTo?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const t = await getTranslations("auth");
  const { returnTo: returnToParam } = await searchParams;
  const returnTo = sanitizeReturnTo(returnToParam);

  return (
    <MarketingPageShell maxWidth="narrow">
      <Card className="bg-card/90">
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {t("registerEyebrow")}
          </p>
          <h1 className="text-2xl leading-none font-semibold">{t("registerTitle")}</h1>
          <CardDescription>{t("registerDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <PasskeyRegisterForm returnTo={returnTo} />
          <p className="mt-5">
            <Link
              href="/"
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
