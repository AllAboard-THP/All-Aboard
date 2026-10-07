import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";

import { MyListContent } from "@/components/features/my-list-content";
import { Link } from "@/i18n/navigation";
import { fetchMyHelpRequests } from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function MyPostsPage() {
  const t = await getTranslations("social");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="my-posts-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link
                  href="/login?returnTo=%2Fme%2Fposts"
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

  const result = await fetchMyHelpRequests(token);

  if (!result.ok) {
    return (
      <MyListContent
        kind="posts"
        items={[]}
        loadError={result.error}
      />
    );
  }

  return (
    <MyListContent
      kind="posts"
      items={result.data.items}
      loadError={null}
    />
  );
}
