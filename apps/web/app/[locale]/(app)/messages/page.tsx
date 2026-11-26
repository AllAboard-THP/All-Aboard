import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";

import { MessagesPageContent } from "@/components/features/messages-page-content";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import {
  fetchAuthMe,
  fetchConversations,
} from "@/lib/api-server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const t = await getTranslations("messages");
  const locale = (await getLocale()) as AppLocale;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert data-testid="messages-unauthenticated">
          <AlertTitle>{t("loginRequiredTitle")}</AlertTitle>
          <AlertDescription>
            {t.rich("loginRequiredDescription", {
              link: () => (
                <Link href="/login?returnTo=%2Fmessages" className="text-primary underline">
                  {t("loginRequiredLink")}
                </Link>
              ),
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const meResult = await fetchAuthMe(token);
  if (!meResult.ok) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6">
        <Alert variant="destructive" data-testid="messages-auth-error">
          <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
          <AlertDescription>{meResult.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const inboxResult = await fetchConversations(token);

  const currentUser = {
    userId: meResult.data.userId,
    displayName:
      meResult.data.fullName?.trim() ||
      meResult.data.displayName?.trim() ||
      meResult.data.userId,
    avatarUrl: meResult.data.avatarUrl,
  };

  return (
    <MessagesPageContent
      locale={locale}
      selectedConversationId={null}
      inboxItems={inboxResult.ok ? inboxResult.data.items : []}
      inboxError={inboxResult.ok ? null : inboxResult.error}
      messages={null}
      messagesError={null}
      currentUser={currentUser}
    />
  );
}
