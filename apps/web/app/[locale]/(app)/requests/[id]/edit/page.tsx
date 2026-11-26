import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { HelpRequestEditForm } from "@/components/features/help-request-edit-form";
import { Link } from "@/i18n/navigation";
import { fetchHelpRequest } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditHelpRequestPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("helpRequest");
  const result = await fetchHelpRequest(id);

  if (!result.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card data-testid="help-edit-not-found">
          <CardHeader>
            <CardTitle className="text-2xl">{t("notFoundTitle")}</CardTitle>
            <CardDescription>
              {t("notFoundDescription", { id })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="text-sm font-semibold text-primary hover:underline">
              {t("editBackToFeed")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {t("eyebrow")}
          </p>
          <CardTitle className="text-2xl">{t("editTitle")}</CardTitle>
          <CardDescription>{t("editDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <HelpRequestEditForm requestId={id} initialItem={result.data.item} />
          <p className="mt-5">
            <Link
              href={`/requests/${id}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("editBackToDetail")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
