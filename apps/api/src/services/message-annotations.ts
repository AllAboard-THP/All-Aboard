import {
  type AnyColumn,
  and,
  asc,
  count,
  eq,
  gt,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type {
  ConversationParticipantSummary,
  MessageAnnotation,
  MessageAnnotationRect,
  MessageAnnotationReply,
} from "@allaboard/types";
import { z } from "zod";

import type { AppDatabase } from "../db/client.js";
import {
  messageAnnotationReads,
  messageAnnotationReplies,
  messageAnnotations,
  messages,
  users,
} from "../db/schema.js";
import { displayNameFromUser } from "../lib/user-mappers.js";
import { MESSAGE_SCREEN_MAX_DURATION_MS } from "./message-media-upload-rules.js";

export const ANNOTATION_BODY_MAX_LENGTH = 1000;

const bodySchema = z.string().trim().min(1).max(ANNOTATION_BODY_MAX_LENGTH);

const rectSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    w: z.number().gt(0).max(1),
    h: z.number().gt(0).max(1),
  })
  .strict();

export const createAnnotationBodySchema = z
  .object({
    atMs: z.number().int().min(0),
    rect: rectSchema.optional(),
    body: bodySchema,
  })
  .strict();

export const updateAnnotationBodySchema = z
  .object({
    body: bodySchema.optional(),
    resolved: z.boolean().optional(),
  })
  .strict()
  .refine((v) => v.body !== undefined || v.resolved !== undefined);

export const replyBodySchema = z.object({ body: bodySchema }).strict();

type MessageRow = typeof messages.$inferSelect;
type AnnotationRow = typeof messageAnnotations.$inferSelect;
type ReplyRow = typeof messageAnnotationReplies.$inferSelect;
type UserRow = typeof users.$inferSelect;

/**
 * Checks what zod cannot: the rectangle stays inside the frame, and the
 * timestamp is inside the video. Floating point slack of 1e-9 on the edges.
 */
export function validateAnnotationPlacement(
  atMs: number,
  rect: MessageAnnotationRect | undefined,
  durationMs: number | null,
): "invalid_timestamp" | "invalid_rect" | null {
  const maxMs = durationMs ?? MESSAGE_SCREEN_MAX_DURATION_MS;
  if (atMs > maxMs) return "invalid_timestamp";
  if (
    rect &&
    (rect.x >= 1 ||
      rect.y >= 1 ||
      rect.x + rect.w > 1 + 1e-9 ||
      rect.y + rect.h > 1 + 1e-9)
  ) {
    return "invalid_rect";
  }
  return null;
}

function clampRect(rect: MessageAnnotationRect): MessageAnnotationRect {
  const w = Math.min(rect.w, 1 - rect.x);
  const h = Math.min(rect.h, 1 - rect.y);
  return { x: rect.x, y: rect.y, w, h };
}

function toSummary(user: UserRow): ConversationParticipantSummary {
  return {
    id: user.id,
    displayName: displayNameFromUser(user),
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

function replyToDto(row: ReplyRow, author: UserRow): MessageAnnotationReply {
  return {
    id: row.id,
    annotationId: row.annotationId,
    author: toSummary(author),
    ...(row.deletedAt ? {} : { body: row.body }),
    ...(row.editedAt ? { editedAt: row.editedAt.toISOString() } : {}),
    ...(row.deletedAt ? { deletedAt: row.deletedAt.toISOString() } : {}),
    createdAt: row.createdAt.toISOString(),
  };
}

function annotationToDto(
  row: AnnotationRow,
  author: UserRow,
  replies: MessageAnnotationReply[],
): MessageAnnotation {
  const hasRect =
    row.rectX != null && row.rectY != null && row.rectW != null && row.rectH != null;
  return {
    id: row.id,
    messageId: row.messageId,
    author: toSummary(author),
    atMs: row.atMs,
    ...(hasRect
      ? { rect: { x: row.rectX!, y: row.rectY!, w: row.rectW!, h: row.rectH! } }
      : {}),
    ...(row.deletedAt ? {} : { body: row.body }),
    ...(row.resolvedAt ? { resolvedAt: row.resolvedAt.toISOString() } : {}),
    ...(row.resolvedAt && row.resolvedBy ? { resolvedBy: row.resolvedBy } : {}),
    ...(row.editedAt ? { editedAt: row.editedAt.toISOString() } : {}),
    ...(row.deletedAt ? { deletedAt: row.deletedAt.toISOString() } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    replies,
  };
}

export async function findMessageInConversation(
  db: AppDatabase,
  conversationId: string,
  messageId: string,
): Promise<MessageRow | null> {
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.id, messageId), eq(messages.conversationId, conversationId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findAnnotationWithMessage(
  db: AppDatabase,
  annotationId: string,
): Promise<{ annotation: AnnotationRow; message: MessageRow } | null> {
  const rows = await db
    .select({ annotation: messageAnnotations, message: messages })
    .from(messageAnnotations)
    .innerJoin(messages, eq(messageAnnotations.messageId, messages.id))
    .where(eq(messageAnnotations.id, annotationId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findReplyWithContext(
  db: AppDatabase,
  replyId: string,
): Promise<{ reply: ReplyRow; annotation: AnnotationRow; message: MessageRow } | null> {
  const rows = await db
    .select({
      reply: messageAnnotationReplies,
      annotation: messageAnnotations,
      message: messages,
    })
    .from(messageAnnotationReplies)
    .innerJoin(
      messageAnnotations,
      eq(messageAnnotationReplies.annotationId, messageAnnotations.id),
    )
    .innerJoin(messages, eq(messageAnnotations.messageId, messages.id))
    .where(eq(messageAnnotationReplies.id, replyId))
    .limit(1);
  return rows[0] ?? null;
}

async function loadAnnotationDtos(
  db: AppDatabase,
  where: ReturnType<typeof eq>,
): Promise<MessageAnnotation[]> {
  const rows = await db
    .select({ annotation: messageAnnotations, author: users })
    .from(messageAnnotations)
    .innerJoin(users, eq(messageAnnotations.authorId, users.id))
    .where(where)
    .orderBy(asc(messageAnnotations.atMs), asc(messageAnnotations.createdAt));
  if (rows.length === 0) return [];

  const replyRows = await db
    .select({ reply: messageAnnotationReplies, author: users })
    .from(messageAnnotationReplies)
    .innerJoin(users, eq(messageAnnotationReplies.authorId, users.id))
    .where(
      inArray(
        messageAnnotationReplies.annotationId,
        rows.map((r) => r.annotation.id),
      ),
    )
    .orderBy(asc(messageAnnotationReplies.createdAt));

  const repliesByAnnotation = new Map<string, MessageAnnotationReply[]>();
  for (const r of replyRows) {
    const list = repliesByAnnotation.get(r.reply.annotationId) ?? [];
    list.push(replyToDto(r.reply, r.author));
    repliesByAnnotation.set(r.reply.annotationId, list);
  }

  return rows.map((r) =>
    annotationToDto(r.annotation, r.author, repliesByAnnotation.get(r.annotation.id) ?? []),
  );
}

export async function loadAnnotationsForMessage(
  db: AppDatabase,
  messageId: string,
): Promise<MessageAnnotation[]> {
  return loadAnnotationDtos(db, eq(messageAnnotations.messageId, messageId));
}

export async function loadAnnotation(
  db: AppDatabase,
  annotationId: string,
): Promise<MessageAnnotation | null> {
  const items = await loadAnnotationDtos(db, eq(messageAnnotations.id, annotationId));
  return items[0] ?? null;
}

export async function loadReply(
  db: AppDatabase,
  replyId: string,
): Promise<MessageAnnotationReply | null> {
  const rows = await db
    .select({ reply: messageAnnotationReplies, author: users })
    .from(messageAnnotationReplies)
    .innerJoin(users, eq(messageAnnotationReplies.authorId, users.id))
    .where(eq(messageAnnotationReplies.id, replyId))
    .limit(1);
  const row = rows[0];
  return row ? replyToDto(row.reply, row.author) : null;
}

/**
 * Counts per video message, for one viewer: annotations not deleted, and
 * annotations plus replies by someone else written after the viewer's read marker.
 */
export async function loadAnnotationCounts(
  db: AppDatabase,
  messageIds: string[],
  viewerId: string,
): Promise<Map<string, { total: number; unread: number }>> {
  const counts = new Map<string, { total: number; unread: number }>();
  if (messageIds.length === 0) return counts;
  for (const id of messageIds) counts.set(id, { total: 0, unread: 0 });

  const readJoin = and(
    eq(messageAnnotationReads.messageId, messageAnnotations.messageId),
    eq(messageAnnotationReads.userId, viewerId),
  );
  const unreadAfter = (createdAt: AnyColumn) =>
    or(
      isNull(messageAnnotationReads.lastReadAt),
      gt(createdAt, messageAnnotationReads.lastReadAt),
    );

  const totals = await db
    .select({ messageId: messageAnnotations.messageId, total: count() })
    .from(messageAnnotations)
    .where(
      and(
        inArray(messageAnnotations.messageId, messageIds),
        isNull(messageAnnotations.deletedAt),
      ),
    )
    .groupBy(messageAnnotations.messageId);
  for (const row of totals) counts.get(row.messageId)!.total = Number(row.total);

  const unreadAnnotations = await db
    .select({ messageId: messageAnnotations.messageId, total: count() })
    .from(messageAnnotations)
    .leftJoin(messageAnnotationReads, readJoin)
    .where(
      and(
        inArray(messageAnnotations.messageId, messageIds),
        isNull(messageAnnotations.deletedAt),
        ne(messageAnnotations.authorId, viewerId),
        unreadAfter(messageAnnotations.createdAt),
      ),
    )
    .groupBy(messageAnnotations.messageId);
  for (const row of unreadAnnotations) {
    counts.get(row.messageId)!.unread += Number(row.total);
  }

  const unreadReplies = await db
    .select({ messageId: messageAnnotations.messageId, total: count() })
    .from(messageAnnotationReplies)
    .innerJoin(
      messageAnnotations,
      eq(messageAnnotationReplies.annotationId, messageAnnotations.id),
    )
    .leftJoin(messageAnnotationReads, readJoin)
    .where(
      and(
        inArray(messageAnnotations.messageId, messageIds),
        isNull(messageAnnotationReplies.deletedAt),
        ne(messageAnnotationReplies.authorId, viewerId),
        unreadAfter(messageAnnotationReplies.createdAt),
      ),
    )
    .groupBy(messageAnnotations.messageId);
  for (const row of unreadReplies) {
    counts.get(row.messageId)!.unread += Number(row.total);
  }

  return counts;
}

export async function markAnnotationsRead(
  db: AppDatabase,
  messageId: string,
  userId: string,
): Promise<Date> {
  const now = new Date();
  await db
    .insert(messageAnnotationReads)
    .values({ messageId, userId, lastReadAt: now })
    .onConflictDoUpdate({
      target: [messageAnnotationReads.messageId, messageAnnotationReads.userId],
      set: { lastReadAt: now },
    });
  return now;
}

export async function insertAnnotation(
  db: AppDatabase,
  input: {
    messageId: string;
    authorId: string;
    atMs: number;
    rect?: MessageAnnotationRect;
    body: string;
  },
): Promise<string> {
  const rect = input.rect ? clampRect(input.rect) : undefined;
  const [row] = await db
    .insert(messageAnnotations)
    .values({
      messageId: input.messageId,
      authorId: input.authorId,
      atMs: input.atMs,
      rectX: rect?.x ?? null,
      rectY: rect?.y ?? null,
      rectW: rect?.w ?? null,
      rectH: rect?.h ?? null,
      body: input.body,
    })
    .returning({ id: messageAnnotations.id });
  if (!row) throw new Error("annotation_insert_failed");
  return row.id;
}

export async function updateAnnotation(
  db: AppDatabase,
  annotationId: string,
  viewerId: string,
  change: { body?: string; resolved?: boolean },
): Promise<void> {
  const now = new Date();
  const set: Partial<typeof messageAnnotations.$inferInsert> = { updatedAt: now };
  if (change.body !== undefined) {
    set.body = change.body;
    set.editedAt = now;
  }
  if (change.resolved === true) {
    set.resolvedAt = now;
    set.resolvedBy = viewerId;
  } else if (change.resolved === false) {
    set.resolvedAt = null;
    set.resolvedBy = null;
  }
  await db
    .update(messageAnnotations)
    .set(set)
    .where(eq(messageAnnotations.id, annotationId));
}

export async function softDeleteAnnotation(
  db: AppDatabase,
  annotationId: string,
): Promise<void> {
  const now = new Date();
  await db
    .update(messageAnnotations)
    .set({ deletedAt: sql`coalesce(${messageAnnotations.deletedAt}, ${now})`, updatedAt: now })
    .where(eq(messageAnnotations.id, annotationId));
}

export async function insertReply(
  db: AppDatabase,
  annotationId: string,
  authorId: string,
  body: string,
): Promise<string> {
  const [row] = await db
    .insert(messageAnnotationReplies)
    .values({ annotationId, authorId, body })
    .returning({ id: messageAnnotationReplies.id });
  if (!row) throw new Error("annotation_reply_insert_failed");
  await db
    .update(messageAnnotations)
    .set({ updatedAt: new Date() })
    .where(eq(messageAnnotations.id, annotationId));
  return row.id;
}

export async function updateReply(
  db: AppDatabase,
  replyId: string,
  body: string,
): Promise<void> {
  const now = new Date();
  await db
    .update(messageAnnotationReplies)
    .set({ body, editedAt: now, updatedAt: now })
    .where(eq(messageAnnotationReplies.id, replyId));
}

export async function softDeleteReply(db: AppDatabase, replyId: string): Promise<void> {
  const now = new Date();
  await db
    .update(messageAnnotationReplies)
    .set({
      deletedAt: sql`coalesce(${messageAnnotationReplies.deletedAt}, ${now})`,
      updatedAt: now,
    })
    .where(eq(messageAnnotationReplies.id, replyId));
}
