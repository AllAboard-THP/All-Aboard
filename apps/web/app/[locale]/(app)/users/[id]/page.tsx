import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { UserPublicContent } from "@/components/features/user-public-content";
import { Link } from "@/i18n/navigation";
import { fetchPublicUser } from "@/lib/api-server";
import { parsePublicUserSearchParams } from "@/lib/user-search-params";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UserPublicPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const pageParams = parsePublicUserSearchParams(resolvedSearchParams);
  const t = await getTranslations("profile.public");
  const tFeed = await getTranslations("feed");

  const result = await fetchPublicUser(id, pageParams);

  if (result.ok) {
    return (
      <UserPublicContent userId={id} data={result.data} params={pageParams} />
    );
  }

  if (result.status === 404 || result.error === "not_found") {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="user-not-found">
          <AlertTitle>{t("notFoundTitle")}</AlertTitle>
          <AlertDescription>{t("notFoundDescription", { id })}</AlertDescription>
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
    <div className="mx-auto w-full max-w-3xl p-6">
      <Alert variant="destructive" data-testid="user-load-error">
        <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
      <div className="mt-4">
        <Button variant="outline" asChild>
          <Link href="/">{tFeed("backToFeed")}</Link>
        </Button>
      </div>
    </div>
  );
}
