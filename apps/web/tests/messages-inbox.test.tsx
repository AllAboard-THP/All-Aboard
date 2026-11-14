import type { ConversationInboxItem } from "@allaboard/types";
import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MessagesInbox } from "@/components/features/messages-inbox";
import { renderWithI18n } from "./i18n-test-utils";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

function inboxItem(
  lastMessage: ConversationInboxItem["lastMessage"],
  id = "conv-1",
): ConversationInboxItem {
  return {
    id,
    updatedAt: "2026-07-07T10:00:00.000Z",
    otherParticipant: {
      id: "user-2",
      displayName: "Alice Mentor",
    },
    lastMessage,
    unreadCount: 0,
  };
}

describe("MessagesInbox", () => {
  it("shows the text body without a media icon", () => {
    renderWithI18n(
      <MessagesInbox
        locale="fr"
        selectedId={null}
        items={[
          inboxItem({
            id: "msg-1",
            kind: "text",
            body: "On se retrouve à 14h",
            userId: "user-2",
            userName: "Alice Mentor",
            createdAt: "2026-07-07T10:00:00.000Z",
            type: "message",
          }),
        ]}
      />,
    );

    const item = screen.getByTestId("messages-inbox-item");
    expect(within(item).getByTestId("messages-inbox-preview").textContent).toBe(
      "On se retrouve à 14h",
    );
    expect(within(item).queryByTestId("messages-inbox-kind")).toBeNull();
  });

  it("previews a voice message and a captioned video with a kind icon", () => {
    renderWithI18n(
      <MessagesInbox
        locale="fr"
        selectedId={null}
        items={[
          inboxItem(
            {
              id: "msg-audio",
              kind: "audio",
              userId: "user-2",
              userName: "Alice Mentor",
              createdAt: "2026-07-07T10:00:00.000Z",
              type: "message",
              attachment: {
                url: "/uploads/messages/voice.webm",
                mimeType: "audio/webm",
                sizeBytes: 100,
                durationMs: 2000,
                source: "microphone",
              },
            },
            "conv-audio",
          ),
          inboxItem(
            {
              id: "msg-video",
              kind: "video",
              body: "Regarde ce passage",
              userId: "user-2",
              userName: "Alice Mentor",
              createdAt: "2026-07-07T10:01:00.000Z",
              type: "message",
              attachment: {
                url: "/uploads/messages/clip.webm",
                mimeType: "video/webm",
                sizeBytes: 400,
                durationMs: 8000,
                source: "camera",
              },
            },
            "conv-video",
          ),
        ]}
      />,
    );

    const items = screen.getAllByTestId("messages-inbox-item");
    const audio = items[0]!;
    const video = items[1]!;

    expect(within(audio).getByTestId("messages-inbox-preview").textContent).toBe(
      "Message vocal",
    );
    expect(within(audio).getByTestId("messages-inbox-kind").getAttribute("data-kind")).toBe(
      "audio",
    );
    expect(within(video).getByTestId("messages-inbox-preview").textContent).toBe(
      "Regarde ce passage",
    );
    expect(within(video).getByTestId("messages-inbox-kind").getAttribute("data-kind")).toBe(
      "video",
    );
  });
});
