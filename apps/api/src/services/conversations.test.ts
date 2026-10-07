import { describe, it, expect } from "vitest";
import { rowToChatMessage } from "./conversations.js";

describe("rowToChatMessage", () => {
  const author = {
    id: "user-1",
    fullName: "Alice",
    email: "alice@example.com",
    avatarUrl: "https://example.com/a.png",
  };

  it("maps text messages with kind and body", () => {
    const message = rowToChatMessage(
      {
        id: "msg-1",
        conversationId: "conv-1",
        userId: "user-1",
        messageKind: "text",
        body: "Hello",
        attachmentKey: null,
        attachmentMime: null,
        attachmentSizeBytes: null,
        attachmentDurationMs: null,
        attachmentSource: null,
        createdAt: new Date("2026-01-01T12:00:00.000Z"),
        updatedAt: new Date("2026-01-01T12:00:00.000Z"),
      },
      author,
    );

    expect(message).toMatchObject({
      id: "msg-1",
      kind: "text",
      body: "Hello",
      userId: "user-1",
      userName: "Alice",
      type: "message",
    });
    expect(message.attachment).toBeUndefined();
  });

  it("maps media messages with attachment metadata", () => {
    const previous = process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
    process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL =
      "https://api.example.com/uploads/messages";
    try {
      const message = rowToChatMessage(
        {
          id: "msg-2",
          conversationId: "conv-1",
          userId: "user-1",
          messageKind: "audio",
          body: null,
          attachmentKey: "conv-1/msg-2.webm",
          attachmentMime: "audio/webm",
          attachmentSizeBytes: 4096,
          attachmentDurationMs: 12_000,
          attachmentSource: "microphone",
          createdAt: new Date("2026-01-01T12:00:00.000Z"),
          updatedAt: new Date("2026-01-01T12:00:00.000Z"),
        },
        author,
      );

      expect(message.kind).toBe("audio");
      expect(message.body).toBeUndefined();
      expect(message.attachment).toEqual({
        url: "https://api.example.com/uploads/messages/conv-1/msg-2.webm",
        mimeType: "audio/webm",
        sizeBytes: 4096,
        durationMs: 12_000,
        source: "microphone",
      });
    } finally {
      if (previous === undefined) {
        delete process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL;
      } else {
        process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL = previous;
      }
    }
  });
});
