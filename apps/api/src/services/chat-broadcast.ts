import type { ChatMessage } from "@allaboard/types";
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
  const sockets = subscribersByConversation.get(conversationId);
  if (!sockets?.size) return;
  const payload = JSON.stringify(message);
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
