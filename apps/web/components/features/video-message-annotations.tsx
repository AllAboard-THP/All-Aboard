"use client";

import type { ChatMessage, MessageAnnotation } from "@allaboard/types";
import {
  AnnotatedVideoPlayer,
  type AnnotatedVideoLabels,
  type VideoAnnotationView,
} from "@allaboard/ui/patterns/annotated-video-player";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  applyAnnotationEvent,
  createMessageAnnotation,
  deleteMessageAnnotation,
  deleteMessageAnnotationReply,
  fetchMessageAnnotations,
  markMessageAnnotationsRead,
  replyToMessageAnnotation,
  updateMessageAnnotation,
  updateMessageAnnotationReply,
  type AnnotationBus,
  type AnnotationSocketEvent,
} from "@/lib/annotation-client";

type Props = {
  conversationId: string;
  message: ChatMessage;
  currentUserId: string;
  bus: AnnotationBus;
};

function toView(item: MessageAnnotation, currentUserId: string): VideoAnnotationView {
  return {
    id: item.id,
    atMs: item.atMs,
    ...(item.rect ? { rect: item.rect } : {}),
    authorName: item.author.displayName,
    ...(item.body !== undefined ? { body: item.body } : {}),
    mine: item.author.id === currentUserId,
    resolved: Boolean(item.resolvedAt),
    deleted: Boolean(item.deletedAt),
    edited: Boolean(item.editedAt),
    replies: item.replies.map((reply) => ({
      id: reply.id,
      authorName: reply.author.displayName,
      ...(reply.body !== undefined ? { body: reply.body } : {}),
      mine: reply.author.id === currentUserId,
      deleted: Boolean(reply.deletedAt),
      edited: Boolean(reply.editedAt),
    })),
  };
}

function eventAuthorId(event: AnnotationSocketEvent): string {
  return "annotation" in event ? event.annotation.author.id : event.reply.author.id;
}

/** Annotated player for one video message: loads, mutates and follows its annotations (#197). */
export function VideoMessageAnnotations({
  conversationId,
  message,
  currentUserId,
  bus,
}: Props) {
  const t = useTranslations("messages");
  const [items, setItems] = useState<MessageAnnotation[]>([]);
  const [unread, setUnread] = useState(message.unreadAnnotationCount ?? 0);
  const loadedRef = useRef(false);
  const panelOpenRef = useRef(false);

  const labels: AnnotatedVideoLabels = {
    video: t("previewVideo"),
    annotate: t("annotate"),
    annotations: t("annotations"),
    unread: t("annotationsUnread"),
    markers: t("annotationMarkers"),
    composerTitle: t("annotationComposerTitle"),
    time: t("annotationTime"),
    earlier: t("annotationEarlier"),
    later: t("annotationLater"),
    pointArea: t("annotationPointArea"),
    removeArea: t("annotationRemoveArea"),
    drawHint: t("annotationDrawHint"),
    bodyPlaceholder: t("annotationBodyPlaceholder"),
    send: t("annotationSend"),
    cancel: t("annotationCancel"),
    reply: t("annotationReply"),
    replyPlaceholder: t("annotationReplyPlaceholder"),
    resolve: t("annotationResolve"),
    reopen: t("annotationReopen"),
    resolved: t("annotationResolved"),
    edit: t("annotationEdit"),
    save: t("annotationSave"),
    delete: t("annotationDelete"),
    edited: t("annotationEdited"),
    deletedAnnotation: t("annotationDeleted"),
    deletedReply: t("annotationReplyDeleted"),
    empty: t("annotationsEmpty"),
    error: t("annotationError"),
    close: t("annotationsClose"),
  };

  const load = useCallback(async () => {
    loadedRef.current = true;
    try {
      const res = await fetchMessageAnnotations(conversationId, message.id);
      setItems(res.items);
      if (!panelOpenRef.current) setUnread(res.unreadCount);
    } catch {
      loadedRef.current = false;
    }
  }, [conversationId, message.id]);

  useEffect(() => {
    if ((message.annotationCount ?? 0) > 0 && !loadedRef.current) {
      void load();
    }
  }, [load, message.annotationCount]);

  useEffect(
    () =>
      bus.subscribe(message.id, (event) => {
        setItems((prev) => applyAnnotationEvent(prev, event));
        if (eventAuthorId(event) === currentUserId || !event.type.endsWith(".created")) {
          return;
        }
        if (panelOpenRef.current) {
          void markMessageAnnotationsRead(conversationId, message.id).catch(() => undefined);
        } else {
          setUnread((n) => n + 1);
        }
      }),
    [bus, conversationId, currentUserId, message.id],
  );

  const apply = useCallback((event: AnnotationSocketEvent) => {
    setItems((prev) => applyAnnotationEvent(prev, event));
  }, []);

  const views = useMemo(
    () => items.map((item) => toView(item, currentUserId)),
    [items, currentUserId],
  );

  return (
    <AnnotatedVideoPlayer
      src={message.attachment!.url}
      durationMs={message.attachment?.durationMs}
      labels={labels}
      annotations={views}
      unreadCount={unread}
      onOpenPanel={() => {
        panelOpenRef.current = true;
        setUnread(0);
        if (!loadedRef.current) void load();
        void markMessageAnnotationsRead(conversationId, message.id).catch(() => undefined);
      }}
      onClosePanel={() => {
        panelOpenRef.current = false;
      }}
      onCreate={async (input) => {
        const { item } = await createMessageAnnotation(conversationId, message.id, input);
        apply({ type: "annotation.created", messageId: message.id, annotation: item });
      }}
      onReply={async (annotationId, body) => {
        const { item } = await replyToMessageAnnotation(annotationId, body);
        apply({
          type: "annotation_reply.created",
          messageId: message.id,
          annotationId,
          reply: item,
        });
      }}
      onResolve={async (annotationId, resolved) => {
        const { item } = await updateMessageAnnotation(annotationId, { resolved });
        apply({ type: "annotation.updated", messageId: message.id, annotation: item });
      }}
      onEdit={async (annotationId, body) => {
        const { item } = await updateMessageAnnotation(annotationId, { body });
        apply({ type: "annotation.updated", messageId: message.id, annotation: item });
      }}
      onDelete={async (annotationId) => {
        const { item } = await deleteMessageAnnotation(annotationId);
        apply({ type: "annotation.deleted", messageId: message.id, annotation: item });
      }}
      onEditReply={async (replyId, body) => {
        const { item } = await updateMessageAnnotationReply(replyId, body);
        apply({
          type: "annotation_reply.updated",
          messageId: message.id,
          annotationId: item.annotationId,
          reply: item,
        });
      }}
      onDeleteReply={async (replyId) => {
        const { item } = await deleteMessageAnnotationReply(replyId);
        apply({
          type: "annotation_reply.deleted",
          messageId: message.id,
          annotationId: item.annotationId,
          reply: item,
        });
      }}
    />
  );
}
