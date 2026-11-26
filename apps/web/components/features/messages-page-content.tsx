import type {
  ChatMessage,
  ConversationInboxItem,
  MessagesListResponse,
} from "@allaboard/types";
import { getTranslations } from "next-intl/server";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";

import { ChatThread } from "@/components/features/chat-thread";
import { MessagesInbox } from "@/components/features/messages-inbox";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type CurrentUser = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
};

type Props = {
  locale: AppLocale;
  selectedConversationId: string | null;
  inboxItems: ConversationInboxItem[];
  inboxError: string | null;
  messages: MessagesListResponse | null;
  messagesError: string | null;
  currentUser: CurrentUser;
};

export async function MessagesPageContent({
  locale,
  selectedConversationId,
  inboxItems,
  inboxError,
  messages,
  messagesError,
  currentUser,
}: Props) {
  const t = await getTranslations("messages");

  const selectedItem =
    selectedConversationId ?
      inboxItems.find((item) => item.id === selectedConversationId)
    : null;

  const threadMessages: ChatMessage[] = messages?.items ?? [];
  const peerFromMessages = threadMessages.find(
    (m) => m.userId !== currentUser.userId,
  );
  const peerDisplayName =
    selectedItem?.otherParticipant.displayName ??
    peerFromMessages?.userName ??
    t("unknownPeer");
  const peerAvatarUrl =
    selectedItem?.otherParticipant.avatarUrl ?? peerFromMessages?.avatarUrl;
  const showMobileThread = Boolean(selectedConversationId);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div
        className="flex h-[calc(100vh-10rem)] min-h-[28rem] overflow-hidden rounded-xl border border-border bg-card"
        data-testid="messages-shell"
      >
        <aside
          className={
            showMobileThread ?
              "hidden w-full flex-col border-r border-border md:flex md:w-80"
            : "flex w-full flex-col border-r border-border md:w-80"
          }
        >
          {inboxError ? (
            <div className="p-4">
              <Alert variant="destructive" data-testid="messages-inbox-error">
                <AlertTitle>{t("loadErrorTitle")}</AlertTitle>
                <AlertDescription>{inboxError}</AlertDescription>
              </Alert>
            </div>
          ) : (
            <MessagesInbox
              items={inboxItems}
              selectedId={selectedConversationId}
              locale={locale}
            />
          )}
        </aside>

        <section
          className={
            showMobileThread ?
              "flex min-h-0 flex-1 flex-col bg-background"
            : "hidden min-h-0 flex-1 flex-col bg-background md:flex"
          }
        >
          {selectedConversationId && messagesError ?
            <div className="p-6">
              <Alert variant="destructive" data-testid="messages-thread-error">
                <AlertTitle>{t("threadErrorTitle")}</AlertTitle>
                <AlertDescription>{messagesError}</AlertDescription>
              </Alert>
            </div>
          : selectedConversationId ?
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-border px-4 py-2 md:hidden">
                <Link
                  href="/messages"
                  className="text-sm text-primary hover:underline"
                  data-testid="messages-back-to-inbox"
                >
                  {t("backToInbox")}
                </Link>
              </div>
              <ChatThread
                conversationId={selectedConversationId}
                initialMessages={threadMessages}
                currentUser={currentUser}
                locale={locale}
                peerDisplayName={peerDisplayName}
                peerAvatarUrl={peerAvatarUrl}
              />
            </div>
          : <div
              className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground"
              data-testid="messages-empty-thread"
            >
              <p className="m-0 text-sm">{t("selectConversation")}</p>
            </div>
          }
        </section>
      </div>
    </div>
  );
}
