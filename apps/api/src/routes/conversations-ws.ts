import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";
import type { AppDatabase } from "../db/client.js";
import {
  subscribeToConversation,
  unsubscribeFromConversation,
} from "../services/chat-broadcast.js";
import { isConversationParticipant } from "../services/conversations.js";
import { loadUserFromJwtSub } from "../services/user-profile.js";

type JwtPayload = { sub: string; role?: string };

export async function registerConversationWsRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  await app.register(websocket);

  app.get(
    "/conversations/:id/ws",
    { websocket: true },
    (socket: WebSocket, request) => {
      void (async () => {
        if (!db) {
          socket.close(4503, "database_unavailable");
          return;
        }

        const { id: conversationId } = request.params as { id: string };
        const query = request.query as { token?: string };
        const token =
          (typeof query.token === "string" ? query.token.trim() : "") ||
          request.cookies?.access_token;

        if (!token) {
          socket.close(4401, "unauthorized");
          return;
        }

        let payload: JwtPayload;
        try {
          payload = await app.jwt.verify<JwtPayload>(token);
        } catch {
          socket.close(4401, "unauthorized");
          return;
        }

        const user = await loadUserFromJwtSub(db, payload.sub);
        if (!user) {
          socket.close(4401, "unauthorized");
          return;
        }

        const allowed = await isConversationParticipant(
          db,
          conversationId,
          user.id,
        );
        if (!allowed) {
          socket.close(4403, "forbidden");
          return;
        }

        subscribeToConversation(conversationId, socket);
        socket.on("close", () => {
          unsubscribeFromConversation(conversationId, socket);
        });
      })();
    },
  );
}
