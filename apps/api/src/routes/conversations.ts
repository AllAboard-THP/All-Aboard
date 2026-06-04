import type { FastifyInstance } from "fastify";
import type {
  ConversationsListResponse,
  CreateConversationResponse,
  CreateMessageResponse,
  MarkConversationReadResponse,
  MessagesListResponse,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { helpRequests } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getJwtUser } from "../lib/auth-helpers.js";
import {
  createConversationBodySchema,
  createMessageBodySchema,
  parseMessagesListQuery,
} from "../lib/schemas.js";
import { displayNameFromUser } from "../lib/user-mappers.js";
import {
  findOrCreateDirectConversation,
  isConversationParticipant,
  insertMessage,
  loadInboxForUser,
  loadMessagesPage,
  loadOtherParticipant,
  loadParticipantForUser,
  markConversationReadForUser,
  resolveHelpRequestTopic,
} from "../services/conversations.js";
import { loadUserByEmail, loadUserById } from "../services/user-profile.js";

export function registerConversationRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  app.get(
    "/conversations",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<ConversationsListResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const jwtUser = getJwtUser(request);
      const viewer = await loadUserByEmail(db, jwtUser.sub);
      if (!viewer) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      const items = await loadInboxForUser(db, viewer.id);
      return { items };
    },
  );

  app.post(
    "/conversations",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateConversationResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createConversationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const sender = await loadUserByEmail(db, jwtUser.sub);
      if (!sender) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const { recipientId, helpRequestId } = parsed.data;
      if (recipientId === sender.id) {
        return reply.code(400).send({ error: "cannot_message_self" });
      }

      const recipient = await loadUserById(db, recipientId);
      if (!recipient) {
        return reply.code(404).send({ error: "recipient_not_found" });
      }

      let topic: string | null = null;
      if (helpRequestId) {
        const hrRows = await db
          .select({ id: helpRequests.id })
          .from(helpRequests)
          .where(eq(helpRequests.id, helpRequestId))
          .limit(1);
        if (hrRows.length === 0) {
          return reply.code(404).send({ error: "help_request_not_found" });
        }
        topic = await resolveHelpRequestTopic(db, helpRequestId);
      }

      const { conversation, created } = await findOrCreateDirectConversation(
        db,
        sender.id,
        recipient.id,
        topic,
      );

      await markConversationReadForUser(db, conversation.id, sender.id);

      const otherParticipant = await loadOtherParticipant(
        db,
        conversation.id,
        sender.id,
      );
      if (!otherParticipant) {
        return reply.code(500).send({ error: "conversation_participant_missing" });
      }

      const item = {
        id: conversation.id,
        topic: conversation.topic ?? undefined,
        updatedAt: conversation.updatedAt.toISOString(),
        otherParticipant: {
          id: otherParticipant.id,
          displayName: displayNameFromUser(otherParticipant),
          avatarUrl: otherParticipant.avatarUrl ?? undefined,
        },
      };

      return reply.code(created ? 201 : 200).send({ item });
    },
  );

  app.get(
    "/conversations/:id/messages",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessagesListResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id: conversationId } = request.params as { id: string };
      const jwtUser = getJwtUser(request);
      const viewer = await loadUserByEmail(db, jwtUser.sub);
      if (!viewer) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const allowed = await isConversationParticipant(
        db,
        conversationId,
        viewer.id,
      );
      if (!allowed) {
        return reply.code(403).send({ error: "forbidden" });
      }

      const params = parseMessagesListQuery(
        request.query as Record<string, unknown>,
      );
      const { items, total } = await loadMessagesPage(
        db,
        conversationId,
        params.offset,
        params.limit,
      );

      return {
        items,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
        },
      };
    },
  );

  app.post(
    "/conversations/:id/messages",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateMessageResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id: conversationId } = request.params as { id: string };
      const parsed = createMessageBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }

      const jwtUser = getJwtUser(request);
      const sender = await loadUserByEmail(db, jwtUser.sub);
      if (!sender) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const allowed = await isConversationParticipant(
        db,
        conversationId,
        sender.id,
      );
      if (!allowed) {
        return reply.code(403).send({ error: "forbidden" });
      }

      const message = await insertMessage(
        db,
        conversationId,
        sender.id,
        parsed.data.body,
      );
      await markConversationReadForUser(db, conversationId, sender.id);

      return reply.code(201).send({ item: message });
    },
  );

  app.patch(
    "/conversations/:id/read",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MarkConversationReadResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id: conversationId } = request.params as { id: string };
      const jwtUser = getJwtUser(request);
      const viewer = await loadUserByEmail(db, jwtUser.sub);
      if (!viewer) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const allowed = await isConversationParticipant(
        db,
        conversationId,
        viewer.id,
      );
      if (!allowed) {
        return reply.code(403).send({ error: "forbidden" });
      }

      await markConversationReadForUser(db, conversationId, viewer.id);
      const participant = await loadParticipantForUser(
        db,
        conversationId,
        viewer.id,
      );

      return {
        ok: true as const,
        lastReadAt:
          participant?.lastReadAt?.toISOString() ?? new Date().toISOString(),
      };
    },
  );
}
