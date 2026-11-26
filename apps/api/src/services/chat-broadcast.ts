import type { ChatMessage, ChatSocketEvent } from "@allaboard/types";
import type { WebSocket } from "ws";

const OPEN = 1;

const subscribersByConversation = new Map<string, Set<WebSocket>>();

export function subscribeToConversation(
  conversationId: string,
  socket: WebSocket,
): void {
  let sockets = subscribersByConversation.get(conversationId);
  if (!sockets) {
    sockets = new Set();
    subscribersByConversation.set(conversationId, sockets);
  }
  sockets.add(socket);
}

export function unsubscribeFromConversation(
  conversationId: string,
  socket: WebSocket,
): void {
  const sockets = subscribersByConversation.get(conversationId);
  if (!sockets) return;
  sockets.delete(socket);
  if (sockets.size === 0) {
    subscribersByConversation.delete(conversationId);
  }
}

export function broadcastChatMessage(
  conversationId: string,
  message: ChatMessage,
): void {
  broadcastChatEvent(conversationId, message);
}

/** Sends any conversation event: a message, or an annotation change (#197). */
export function broadcastChatEvent(
  conversationId: string,
  event: ChatSocketEvent,
): void {
  const sockets = subscribersByConversation.get(conversationId);
  if (!sockets?.size) return;
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === OPEN) {
      socket.send(payload);
    }
  }
}

/** Test helper — reset in-memory hub between tests. */
export function resetChatBroadcastHub(): void {
  subscribersByConversation.clear();
}
