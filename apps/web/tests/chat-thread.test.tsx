import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatThread } from "@/components/features/chat-thread";
import { renderWithI18n } from "./i18n-test-utils";

class MockWebSocket {
  static latest: MockWebSocket | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.latest = this;
  }

  close() {}
}

afterEach(() => {
  cleanup();
  MockWebSocket.latest = null;
  vi.unstubAllGlobals();
});

describe("ChatThread WebSocket", () => {
  it("renders a voice attachment and ignores media without a file", async () => {
    Element.prototype.scrollIntoView = () => {};
    vi.stubGlobal("WebSocket", MockWebSocket);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/ws-token")) {
          return new Response(JSON.stringify({ token: "tok", expiresIn: 60 }), {
            status: 200,
          });
        }
        return new Response(JSON.stringify({ ok: true, lastReadAt: "2026-07-07T10:00:00.000Z" }), {
          status: 200,
        });
      }),
    );

    renderWithI18n(
      <ChatThread
        conversationId="conv-1"
        initialMessages={[]}
        currentUser={{ userId: "me", displayName: "Bob Dev" }}
        locale="fr"
        peerDisplayName="Alice Mentor"
      />,
    );

    await waitFor(() => {
      expect(MockWebSocket.latest?.onmessage).toBeTypeOf("function");
    });

    const socket = MockWebSocket.latest;
    expect(socket).toBeTruthy();
    socket!.onmessage?.({
      data: JSON.stringify({
        type: "message",
        id: "ws-audio-invalid",
        kind: "audio",
        body: "audio-sans-fichier",
        userId: "peer",
        userName: "Alice Mentor",
        createdAt: "2026-07-07T10:00:00.000Z",
      }),
    });
    socket!.onmessage?.({
      data: JSON.stringify({
        type: "message",
        id: "ws-audio-ok",
        kind: "audio",
        userId: "peer",
        userName: "Alice Mentor",
        createdAt: "2026-07-07T10:00:01.000Z",
        attachment: {
          url: "/uploads/messages/fixture-voice.webm",
          mimeType: "audio/webm",
          sizeBytes: 5,
          durationMs: 1500,
          source: "microphone",
        },
      }),
    });

    const audio = await screen.findByLabelText("Message vocal");
    expect(audio.getAttribute("src")).toBe("/uploads/messages/fixture-voice.webm");
    expect(screen.queryByText("audio-sans-fichier")).toBeNull();
  });
});
