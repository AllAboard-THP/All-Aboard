import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";

import { MyListContent } from "@/components/features/my-list-content";
import { Link } from "@/i18n/navigation";
import { fetchMyBookmarks } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function MyBookmarksPage() {
  const t = await getTranslations("social");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="my-bookmarks-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link
                  href="/login?returnTo=%2Fme%2Fbookmarks"
                  className="text-primary underline"
                >
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const result = await fetchMyBookmarks(token);

  if (!result.ok) {
    return (
      <MyListContent
        kind="bookmarks"
        items={[]}
        loadError={result.error}
      />
    );
  }

  return (
    <MyListContent
      kind="bookmarks"
      items={result.data.items}
      loadError={null}
    />
  );
}
