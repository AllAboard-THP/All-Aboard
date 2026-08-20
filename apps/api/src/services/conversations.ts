import {
  and,
  count,
  desc,
  eq,
  gt,
  ne,
} from "drizzle-orm";
import type {
  AttachmentSource,
  ChatMessage,
  ConversationInboxItem,
  ConversationParticipantSummary,
  MessageKind,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  conversationParticipants,
  conversations,
  helpRequests,
  messages,
  users,
} from "../db/schema.js";
import { buildMessageMediaPublicUrl } from "../lib/message-media-url.js";
import { displayNameFromUser } from "../lib/user-mappers.js";

export function directKeyFor(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join(":");
}

export function rowToChatMessage(
  row: typeof messages.$inferSelect,
  author: Pick<typeof users.$inferSelect, "id" | "fullName" | "email" | "avatarUrl">,
): ChatMessage {
  const kind = row.messageKind as MessageKind;
  const message: ChatMessage = {
    id: row.id,
    kind,
    userId: row.userId,
    userName: displayNameFromUser(author),
    avatarUrl: author.avatarUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    type: "message",
  };

  if (row.body?.trim()) {
    message.body = row.body.trim();
  }

  if (
    row.attachmentKey &&
    row.attachmentMime &&
    row.attachmentSizeBytes != null
  ) {
    message.attachment = {
      url: buildMessageMediaPublicUrl(row.attachmentKey),
      mimeType: row.attachmentMime,
      sizeBytes: row.attachmentSizeBytes,
      ...(row.attachmentDurationMs != null ?
        { durationMs: row.attachmentDurationMs }
      : {}),
      ...(row.attachmentSource ?
        { source: row.attachmentSource as AttachmentSource }
      : {}),
    };
  }

  return message;
}

function rowToParticipantSummary(
  row: typeof users.$inferSelect,
): ConversationParticipantSummary {
  return {
    id: row.id,
    displayName: displayNameFromUser(row),
    avatarUrl: row.avatarUrl ?? undefined,
  };
}

export async function findOrCreateDirectConversation(
  db: AppDatabase,
  senderId: string,
  recipientId: string,
  topic?: string | null,
): Promise<{ conversation: typeof conversations.$inferSelect; created: boolean }> {
  const key = directKeyFor(senderId, recipientId);
  const existing = await db
    .select()
    .from(conversations)
    .where(eq(conversations.directKey, key))
    .limit(1);

  if (existing[0]) {
    await ensureParticipants(db, existing[0].id, senderId, recipientId);
    if (topic?.trim() && !existing[0].topic) {
      await db
        .update(conversations)
        .set({ topic: topic.trim(), updatedAt: new Date() })
        .where(eq(conversations.id, existing[0].id));
      const refreshed = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, existing[0].id))
        .limit(1);
      return { conversation: refreshed[0] ?? existing[0], created: false };
    }
    return { conversation: existing[0], created: false };
  }

  const inserted = await db
    .insert(conversations)
    .values({
      directKey: key,
      topic: topic?.trim() || null,
    })
    .returning();
  const conversation = inserted[0];
  if (!conversation) {
    throw new Error("conversation_insert_failed");
  }
  await ensureParticipants(db, conversation.id, senderId, recipientId);
  return { conversation, created: true };
}

async function ensureParticipants(
  db: AppDatabase,
  conversationId: string,
  userAId: string,
  userBId: string,
): Promise<void> {
  for (const userId of [userAId, userBId]) {
    const rows = await db
      .select({ id: conversationParticipants.id })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
        ),
      )
      .limit(1);
    if (rows.length === 0) {
      await db.insert(conversationParticipants).values({
        conversationId,
        userId,
      });
    }
  }
}

export async function loadParticipantForUser(
  db: AppDatabase,
  conversationId: string,
  userId: string,
) {
  const rows = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function isConversationParticipant(
  db: AppDatabase,
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const row = await loadParticipantForUser(db, conversationId, userId);
  return row !== null;
}

export async function markConversationReadForUser(
  db: AppDatabase,
  conversationId: string,
  userId: string,
): Promise<void> {
  await db
    .update(conversationParticipants)
    .set({ lastReadAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    );
}

export async function countUnreadMessages(
  db: AppDatabase,
  conversationId: string,
  viewerId: string,
  lastReadAt: Date | null,
): Promise<number> {
  const threshold = lastReadAt ?? new Date(0);
  const rows = await db
    .select({ total: count() })
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        ne(messages.userId, viewerId),
        gt(messages.createdAt, threshold),
      ),
    );
  return Number(rows[0]?.total ?? 0);
}

export async function loadOtherParticipant(
  db: AppDatabase,
  conversationId: string,
  viewerId: string,
): Promise<typeof users.$inferSelect | null> {
  const rows = await db
    .select({ user: users })
    .from(conversationParticipants)
    .innerJoin(users, eq(conversationParticipants.userId, users.id))
    .where(
      and(
        eq(conversationParticipants.conversationId, conversationId),
        ne(conversationParticipants.userId, viewerId),
      ),
    )
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function loadLastMessage(
  db: AppDatabase,
  conversationId: string,
): Promise<ChatMessage | undefined> {
  const rows = await db
    .select({ message: messages, user: users })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;
  return rowToChatMessage(row.message, row.user);
}

export async function loadInboxForUser(
  db: AppDatabase,
  viewerId: string,
): Promise<ConversationInboxItem[]> {
  const membership = await db
    .select({
      conversation: conversations,
      lastReadAt: conversationParticipants.lastReadAt,
    })
    .from(conversationParticipants)
    .innerJoin(
      conversations,
      eq(conversationParticipants.conversationId, conversations.id),
    )
    .where(eq(conversationParticipants.userId, viewerId))
    .orderBy(desc(conversations.updatedAt));

  const items: ConversationInboxItem[] = [];
  for (const row of membership) {
    const other = await loadOtherParticipant(db, row.conversation.id, viewerId);
    if (!other) continue;
    const lastMessage = await loadLastMessage(db, row.conversation.id);
    const unreadCount = await countUnreadMessages(
      db,
      row.conversation.id,
      viewerId,
      row.lastReadAt,
    );
    items.push({
      id: row.conversation.id,
      topic: row.conversation.topic ?? undefined,
      updatedAt: row.conversation.updatedAt.toISOString(),
      otherParticipant: rowToParticipantSummary(other),
      lastMessage,
      unreadCount,
    });
  }
  return items;
}

export async function countMessagesInConversation(
  db: AppDatabase,
  conversationId: string,
): Promise<number> {
  const rows = await db
    .select({ total: count() })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));
  return Number(rows[0]?.total ?? 0);
}

export async function loadMessagesPage(
  db: AppDatabase,
  conversationId: string,
  offset: number,
  limit: number,
): Promise<{ items: ChatMessage[]; total: number }> {
  const total = await countMessagesInConversation(db, conversationId);
  const rows = await db
    .select({ message: messages, user: users })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  const items = rows
    .map((r) => rowToChatMessage(r.message, r.user))
    .reverse();
  return { items, total };
}

export type InsertMessageInput =
  | { kind: "text"; body: string }
  | {
      kind: "audio" | "video";
      body?: string;
      attachment: {
        key: string;
        mimeType: string;
        sizeBytes: number;
        durationMs?: number;
        source: AttachmentSource;
      };
    };

export type InsertMessageOptions = {
  messageId?: string;
};

export async function insertMessage(
  db: AppDatabase,
  conversationId: string,
  senderId: string,
  input: InsertMessageInput,
  options?: InsertMessageOptions,
): Promise<ChatMessage> {
  let values: typeof messages.$inferInsert;

  if (input.kind === "text") {
    const body = input.body.trim();
    if (!body) {
      throw new Error("message_body_required");
    }
    values = {
      ...(options?.messageId ? { id: options.messageId } : {}),
      conversationId,
      userId: senderId,
      messageKind: "text",
      body,
    };
  } else {
    const { attachment, body } = input;
    values = {
      ...(options?.messageId ? { id: options.messageId } : {}),
      conversationId,
      userId: senderId,
      messageKind: input.kind,
      body: body?.trim() || null,
      attachmentKey: attachment.key,
      attachmentMime: attachment.mimeType,
      attachmentSizeBytes: attachment.sizeBytes,
      attachmentDurationMs: attachment.durationMs ?? null,
      attachmentSource: attachment.source,
    };
  }

  const inserted = await db.insert(messages).values(values).returning();
  const message = inserted[0];
  if (!message) {
    throw new Error("message_insert_failed");
  }

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  const authorRows = await db
    .select()
    .from(users)
    .where(eq(users.id, senderId))
    .limit(1);
  const author = authorRows[0];
  if (!author) {
    throw new Error("message_author_not_found");
  }
  return rowToChatMessage(message, author);
}

export async function resolveHelpRequestTopic(
  db: AppDatabase,
  helpRequestId: string,
): Promise<string | null> {
  const rows = await db
    .select({ title: helpRequests.title })
    .from(helpRequests)
    .where(eq(helpRequests.id, helpRequestId))
    .limit(1);
  return rows[0]?.title?.trim() || null;
}
