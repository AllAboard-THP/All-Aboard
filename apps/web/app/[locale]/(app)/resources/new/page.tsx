import { getTranslations } from "next-intl/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { ResourceForm } from "@/components/features/resource-form";
import { Link } from "@/i18n/navigation";
import { fetchSubjects } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  const t = await getTranslations("resources");
  const subjectsResult = await fetchSubjects();

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <Card>
        <CardHeader>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {t("newEyebrow")}
          </p>
          <CardTitle className="text-2xl">{t("newTitle")}</CardTitle>
          <CardDescription>{t("newDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm
            mode="create"
            subjects={subjectsResult.ok ? subjectsResult.data.items : []}
          />
          <p className="mt-5">
            <Link
              href="/resources"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("backToList")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
