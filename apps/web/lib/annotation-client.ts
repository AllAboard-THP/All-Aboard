/**
 * Browser calls for video annotations (#197) through the BFF, and the parser
 * for annotation events on the conversation WebSocket.
 * Spec: Docs/product/video-annotations.md.
 */
import type {
  CreateMessageAnnotationBody,
  MarkMessageAnnotationsReadResponse,
  MessageAnnotation,
  MessageAnnotationReply,
  MessageAnnotationReplyResponse,
  MessageAnnotationReplySocketEvent,
  MessageAnnotationResponse,
  MessageAnnotationSocketEvent,
  MessageAnnotationsResponse,
  UpdateMessageAnnotationBody,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

function annotationsPath(conversationId: string, messageId: string): string {
  return `/api/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}/annotations`;
}

async function request<T>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    cache: "no-store",
    ...(body === undefined
      ? {}
      : {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as T;
}

export function fetchMessageAnnotations(
  conversationId: string,
  messageId: string,
): Promise<MessageAnnotationsResponse> {
  return request(annotationsPath(conversationId, messageId), "GET");
}

export function createMessageAnnotation(
  conversationId: string,
  messageId: string,
  body: CreateMessageAnnotationBody,
): Promise<MessageAnnotationResponse> {
  return request(annotationsPath(conversationId, messageId), "POST", body);
}

export function markMessageAnnotationsRead(
  conversationId: string,
  messageId: string,
): Promise<MarkMessageAnnotationsReadResponse> {
  return request(`${annotationsPath(conversationId, messageId)}/read`, "PATCH");
}

export function updateMessageAnnotation(
  annotationId: string,
  body: UpdateMessageAnnotationBody,
): Promise<MessageAnnotationResponse> {
  return request(`/api/annotations/${encodeURIComponent(annotationId)}`, "PATCH", body);
}

export function deleteMessageAnnotation(
  annotationId: string,
): Promise<MessageAnnotationResponse> {
  return request(`/api/annotations/${encodeURIComponent(annotationId)}`, "DELETE");
}

export function replyToMessageAnnotation(
  annotationId: string,
  body: string,
): Promise<MessageAnnotationReplyResponse> {
  return request(
    `/api/annotations/${encodeURIComponent(annotationId)}/replies`,
    "POST",
    { body },
  );
}

export function updateMessageAnnotationReply(
  replyId: string,
  body: string,
): Promise<MessageAnnotationReplyResponse> {
  return request(
    `/api/annotation-replies/${encodeURIComponent(replyId)}`,
    "PATCH",
    { body },
  );
}

export function deleteMessageAnnotationReply(
  replyId: string,
): Promise<MessageAnnotationReplyResponse> {
  return request(`/api/annotation-replies/${encodeURIComponent(replyId)}`, "DELETE");
}

const ANNOTATION_EVENTS = new Set([
  "annotation.created",
  "annotation.updated",
  "annotation.deleted",
]);
const REPLY_EVENTS = new Set([
  "annotation_reply.created",
  "annotation_reply.updated",
  "annotation_reply.deleted",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReply(value: unknown): value is MessageAnnotationReply {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.annotationId === "string" &&
    isRecord(value.author) &&
    typeof value.author.id === "string" &&
    typeof value.createdAt === "string"
  );
}

function isAnnotation(value: unknown): value is MessageAnnotation {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.messageId === "string" &&
    typeof value.atMs === "number" &&
    isRecord(value.author) &&
    typeof value.author.id === "string" &&
    Array.isArray(value.replies) &&
    value.replies.every(isReply)
  );
}

export type AnnotationSocketEvent =
  | MessageAnnotationSocketEvent
  | MessageAnnotationReplySocketEvent;

/** Annotation or reply event from the conversation socket; null for anything else. */
export function parseAnnotationSocketEvent(
  value: unknown,
): AnnotationSocketEvent | null {
  if (!isRecord(value) || typeof value.type !== "string") return null;
  if (typeof value.messageId !== "string") return null;
  if (ANNOTATION_EVENTS.has(value.type) && isAnnotation(value.annotation)) {
    return value as MessageAnnotationSocketEvent;
  }
  if (
    REPLY_EVENTS.has(value.type) &&
    typeof value.annotationId === "string" &&
    isReply(value.reply)
  ) {
    return value as MessageAnnotationReplySocketEvent;
  }
  return null;
}

/** Applies a socket event to a message's annotation list, sorted by time. */
export function applyAnnotationEvent(
  items: MessageAnnotation[],
  event: AnnotationSocketEvent,
): MessageAnnotation[] {
  if ("annotation" in event) {
    const next = items.filter((item) => item.id !== event.annotation.id);
    next.push(event.annotation);
    return next.sort((a, b) => a.atMs - b.atMs || a.createdAt.localeCompare(b.createdAt));
  }
  return items.map((item) => {
    if (item.id !== event.annotationId) return item;
    const replies = item.replies.some((reply) => reply.id === event.reply.id)
      ? item.replies.map((reply) => (reply.id === event.reply.id ? event.reply : reply))
      : [...item.replies, event.reply];
    return { ...item, replies };
  });
}

type AnnotationListener = (event: AnnotationSocketEvent) => void;

/** Routes socket events to the video message they belong to. */
export type AnnotationBus = {
  emit: (event: AnnotationSocketEvent) => void;
  subscribe: (messageId: string, listener: AnnotationListener) => () => void;
};

export function createAnnotationBus(): AnnotationBus {
  const listeners = new Map<string, Set<AnnotationListener>>();
  return {
    emit(event) {
      for (const listener of listeners.get(event.messageId) ?? []) listener(event);
    },
    subscribe(messageId, listener) {
      const set = listeners.get(messageId) ?? new Set();
      set.add(listener);
      listeners.set(messageId, set);
      return () => {
        set.delete(listener);
        if (set.size === 0) listeners.delete(messageId);
      };
    },
  };
}
