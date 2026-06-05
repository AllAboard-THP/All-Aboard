import { describe, it, expect, beforeEach } from "vitest";
import type { ChatMessage } from "@allaboard/types";
import {
  broadcastChatMessage,
  resetChatBroadcastHub,
  subscribeToConversation,
} from "./chat-broadcast.js";

function mockSocket(sent: string[]) {
  return {
    readyState: 1,
    send: (payload: string) => {
      sent.push(payload);
    },
  };
}

describe("chat-broadcast", () => {
  beforeEach(() => {
    resetChatBroadcastHub();
  });

  it("broadcastChatMessage sends JSON to subscribed sockets", () => {
    const convId = "00000000-0000-4000-8000-000000000099";
    const a: string[] = [];
    const b: string[] = [];
    subscribeToConversation(convId, mockSocket(a) as never);
    subscribeToConversation(convId, mockSocket(b) as never);

    const message: ChatMessage = {
      id: "00000000-0000-4000-8000-000000000001",
      body: "Salut",
      userId: "00000000-0000-4000-8000-000000000002",
      userName: "Bob",
      createdAt: new Date().toISOString(),
      type: "message",
    };

    broadcastChatMessage(convId, message);

    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(JSON.parse(a[0]!)).toEqual(message);
  });
});
