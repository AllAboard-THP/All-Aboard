import { cookies } from "next/headers";
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
import { fetchResource, fetchSubjects } from "@/lib/api-server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditResourcePage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("resources");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const [resourceResult, subjectsResult] = await Promise.all([
    fetchResource(id, token),
    fetchSubjects(),
  ]);

  if (!resourceResult.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Card data-testid="resource-edit-not-found">
          <CardHeader>
            <CardTitle className="text-2xl">{t("notFoundTitle")}</CardTitle>
            <CardDescription>{t("notFoundDescription", { id })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/resources"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("backToList")}
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
            {t("detailEyebrow")}
          </p>
          <CardTitle className="text-2xl">{t("editTitle")}</CardTitle>
          <CardDescription>{t("editDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm
            mode="edit"
            resourceId={id}
            initialItem={resourceResult.data.item}
            subjects={subjectsResult.ok ? subjectsResult.data.items : []}
          />
          <p className="mt-5">
            <Link
              href={`/resources/${id}`}
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
