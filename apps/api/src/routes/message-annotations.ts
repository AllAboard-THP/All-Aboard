import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type {
  MarkMessageAnnotationsReadResponse,
  MessageAnnotation,
  MessageAnnotationReply,
  MessageAnnotationReplyResponse,
  MessageAnnotationResponse,
  MessageAnnotationsResponse,
} from "@allaboard/types";

import { isUuid } from "../auth/passkey/config.js";
import type { AppDatabase } from "../db/client.js";
import { getJwtUser } from "../lib/auth-helpers.js";
import { broadcastChatEvent } from "../services/chat-broadcast.js";
import { isConversationParticipant } from "../services/conversations.js";
import {
  createAnnotationBodySchema,
  findAnnotationWithMessage,
  findMessageInConversation,
  findReplyWithContext,
  insertAnnotation,
  insertReply,
  loadAnnotation,
  loadAnnotationCounts,
  loadAnnotationsForMessage,
  loadReply,
  markAnnotationsRead,
  replyBodySchema,
  softDeleteAnnotation,
  softDeleteReply,
  updateAnnotation,
  updateAnnotationBodySchema,
  updateReply,
  validateAnnotationPlacement,
} from "../services/message-annotations.js";
import { loadUserFromJwtSub } from "../services/user-profile.js";

/**
 * #197 — annotations on video messages and their reply threads.
 * Spec: Docs/product/video-annotations.md. Both participants annotate; only
 * the author edits or deletes; either participant resolves.
 */
export function registerMessageAnnotationRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
) {
  async function viewerOr404(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<{ id: string } | null> {
    if (!db) {
      await reply.code(503).send({ error: "database_unavailable" });
      return null;
    }
    const viewer = await loadUserFromJwtSub(db, getJwtUser(request).sub);
    if (!viewer) {
      await reply.code(404).send({ error: "user_not_found" });
      return null;
    }
    return viewer;
  }

  /** Message route guard: participant of the conversation, video message in it. */
  async function videoMessageFor(
    request: FastifyRequest,
    reply: FastifyReply,
    viewerId: string,
  ) {
    const { id, messageId } = request.params as { id: string; messageId: string };
    if (!isUuid(id) || !isUuid(messageId)) {
      await reply.code(404).send({ error: "message_not_found" });
      return null;
    }
    if (!(await isConversationParticipant(db!, id, viewerId))) {
      await reply.code(403).send({ error: "forbidden" });
      return null;
    }
    const message = await findMessageInConversation(db!, id, messageId);
    if (!message) {
      await reply.code(404).send({ error: "message_not_found" });
      return null;
    }
    return message;
  }

  /** Annotation route guard: 404 when it is not in one of the viewer's conversations. */
  async function annotationFor(
    request: FastifyRequest,
    reply: FastifyReply,
    viewerId: string,
  ) {
    const { annotationId } = request.params as { annotationId: string };
    const found = isUuid(annotationId)
      ? await findAnnotationWithMessage(db!, annotationId)
      : null;
    if (
      !found ||
      !(await isConversationParticipant(db!, found.message.conversationId, viewerId))
    ) {
      await reply.code(404).send({ error: "annotation_not_found" });
      return null;
    }
    return found;
  }

  function broadcastAnnotation(
    conversationId: string,
    type: "annotation.created" | "annotation.updated" | "annotation.deleted",
    annotation: MessageAnnotation,
  ) {
    broadcastChatEvent(conversationId, {
      type,
      messageId: annotation.messageId,
      annotation,
    });
  }

  function broadcastReply(
    conversationId: string,
    messageId: string,
    type:
      | "annotation_reply.created"
      | "annotation_reply.updated"
      | "annotation_reply.deleted",
    item: MessageAnnotationReply,
  ) {
    broadcastChatEvent(conversationId, {
      type,
      messageId,
      annotationId: item.annotationId,
      reply: item,
    });
  }

  app.get(
    "/conversations/:id/messages/:messageId/annotations",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationsResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const message = await videoMessageFor(request, reply, viewer.id);
      if (!message) return;

      const items = await loadAnnotationsForMessage(db!, message.id);
      const counts = await loadAnnotationCounts(db!, [message.id], viewer.id);
      return { items, unreadCount: counts.get(message.id)?.unread ?? 0 };
    },
  );

  app.post(
    "/conversations/:id/messages/:messageId/annotations",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const message = await videoMessageFor(request, reply, viewer.id);
      if (!message) return;
      if (message.messageKind !== "video") {
        return reply.code(400).send({ error: "not_a_video_message" });
      }

      const parsed = createAnnotationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const placementError = validateAnnotationPlacement(
        parsed.data.atMs,
        parsed.data.rect,
        message.attachmentDurationMs,
      );
      if (placementError) {
        return reply.code(400).send({ error: placementError });
      }

      const annotationId = await insertAnnotation(db!, {
        messageId: message.id,
        authorId: viewer.id,
        ...parsed.data,
      });
      const item = (await loadAnnotation(db!, annotationId))!;
      broadcastAnnotation(message.conversationId, "annotation.created", item);
      return reply.code(201).send({ item });
    },
  );

  app.patch(
    "/conversations/:id/messages/:messageId/annotations/read",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MarkMessageAnnotationsReadResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const message = await videoMessageFor(request, reply, viewer.id);
      if (!message) return;

      const lastReadAt = await markAnnotationsRead(db!, message.id, viewer.id);
      return { ok: true as const, lastReadAt: lastReadAt.toISOString() };
    },
  );

  app.patch(
    "/annotations/:annotationId",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const found = await annotationFor(request, reply, viewer.id);
      if (!found) return;

      const parsed = updateAnnotationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (found.annotation.deletedAt) {
        return reply.code(409).send({ error: "annotation_deleted" });
      }
      if (
        parsed.data.body !== undefined &&
        found.annotation.authorId !== viewer.id
      ) {
        return reply.code(403).send({ error: "not_author" });
      }

      await updateAnnotation(db!, found.annotation.id, viewer.id, parsed.data);
      const item = (await loadAnnotation(db!, found.annotation.id))!;
      broadcastAnnotation(found.message.conversationId, "annotation.updated", item);
      return { item };
    },
  );

  app.delete(
    "/annotations/:annotationId",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const found = await annotationFor(request, reply, viewer.id);
      if (!found) return;
      if (found.annotation.authorId !== viewer.id) {
        return reply.code(403).send({ error: "not_author" });
      }

      await softDeleteAnnotation(db!, found.annotation.id);
      const item = (await loadAnnotation(db!, found.annotation.id))!;
      broadcastAnnotation(found.message.conversationId, "annotation.deleted", item);
      return { item };
    },
  );

  app.post(
    "/annotations/:annotationId/replies",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationReplyResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const found = await annotationFor(request, reply, viewer.id);
      if (!found) return;

      const parsed = replyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (found.annotation.deletedAt) {
        return reply.code(409).send({ error: "annotation_deleted" });
      }

      const replyId = await insertReply(
        db!,
        found.annotation.id,
        viewer.id,
        parsed.data.body,
      );
      const item = (await loadReply(db!, replyId))!;
      broadcastReply(
        found.message.conversationId,
        found.message.id,
        "annotation_reply.created",
        item,
      );
      return reply.code(201).send({ item });
    },
  );

  /** Reply route guard and author check, shared by edit and delete. */
  async function ownReplyFor(
    request: FastifyRequest,
    reply: FastifyReply,
    viewerId: string,
  ) {
    const { replyId } = request.params as { replyId: string };
    const found = isUuid(replyId) ? await findReplyWithContext(db!, replyId) : null;
    if (
      !found ||
      !(await isConversationParticipant(db!, found.message.conversationId, viewerId))
    ) {
      await reply.code(404).send({ error: "reply_not_found" });
      return null;
    }
    if (found.reply.authorId !== viewerId) {
      await reply.code(403).send({ error: "not_author" });
      return null;
    }
    return found;
  }

  app.patch(
    "/annotation-replies/:replyId",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationReplyResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const found = await ownReplyFor(request, reply, viewer.id);
      if (!found) return;

      const parsed = replyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (found.reply.deletedAt) {
        return reply.code(409).send({ error: "reply_deleted" });
      }

      await updateReply(db!, found.reply.id, parsed.data.body);
      const item = (await loadReply(db!, found.reply.id))!;
      broadcastReply(
        found.message.conversationId,
        found.message.id,
        "annotation_reply.updated",
        item,
      );
      return { item };
    },
  );

  app.delete(
    "/annotation-replies/:replyId",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MessageAnnotationReplyResponse | void> => {
      const viewer = await viewerOr404(request, reply);
      if (!viewer) return;
      const found = await ownReplyFor(request, reply, viewer.id);
      if (!found) return;

      await softDeleteReply(db!, found.reply.id);
      const item = (await loadReply(db!, found.reply.id))!;
      broadcastReply(
        found.message.conversationId,
        found.message.id,
        "annotation_reply.deleted",
        item,
      );
      return { item };
    },
  );
}
