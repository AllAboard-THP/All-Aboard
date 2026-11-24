import { describe, expect, it } from "vitest";
import type { MessageAnnotation } from "@allaboard/types";

import {
  applyAnnotationEvent,
  parseAnnotationSocketEvent,
} from "@/lib/annotation-client";

const author = { id: "user-1", displayName: "Bob" };

function annotation(overrides: Partial<MessageAnnotation> = {}): MessageAnnotation {
  return {
    id: "ann-1",
    messageId: "msg-1",
    author,
    atMs: 4000,
    body: "What is this?",
    createdAt: "2026-11-24T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
    replies: [],
    ...overrides,
  };
}

describe("annotation socket events", () => {
  it("parses annotation and reply events, and ignores chat messages", () => {
    expect(
      parseAnnotationSocketEvent({
        type: "annotation.created",
        messageId: "msg-1",
        annotation: annotation(),
      }),
    ).toMatchObject({ type: "annotation.created" });

    expect(
      parseAnnotationSocketEvent({
        type: "annotation_reply.created",
        messageId: "msg-1",
        annotationId: "ann-1",
        reply: { id: "rep-1", annotationId: "ann-1", author, body: "Here", createdAt: "x" },
      }),
    ).toMatchObject({ type: "annotation_reply.created" });

    expect(parseAnnotationSocketEvent({ type: "message", id: "m", kind: "text" })).toBeNull();
    expect(
      parseAnnotationSocketEvent({ type: "annotation.created", messageId: "msg-1", annotation: {} }),
    ).toBeNull();
  });

  it("inserts annotations by time, replaces updates and appends replies", () => {
    const first = annotation({ id: "ann-2", atMs: 9000 });
    let items = applyAnnotationEvent([first], {
      type: "annotation.created",
      messageId: "msg-1",
      annotation: annotation(),
    });
    expect(items.map((a) => a.id)).toEqual(["ann-1", "ann-2"]);

    items = applyAnnotationEvent(items, {
      type: "annotation.updated",
      messageId: "msg-1",
      annotation: annotation({ resolvedAt: "2026-11-24T11:00:00.000Z" }),
    });
    expect(items).toHaveLength(2);
    expect(items[0]?.resolvedAt).toBeDefined();

    const reply = { id: "rep-1", annotationId: "ann-1", author, body: "A", createdAt: "x" };
    items = applyAnnotationEvent(items, {
      type: "annotation_reply.created",
      messageId: "msg-1",
      annotationId: "ann-1",
      reply,
    });
    items = applyAnnotationEvent(items, {
      type: "annotation_reply.created",
      messageId: "msg-1",
      annotationId: "ann-1",
      reply,
    });
    expect(items[0]?.replies).toHaveLength(1);

    items = applyAnnotationEvent(items, {
      type: "annotation_reply.deleted",
      messageId: "msg-1",
      annotationId: "ann-1",
      reply: { ...reply, body: undefined, deletedAt: "y" },
    });
    expect(items[0]?.replies[0]?.deletedAt).toBe("y");
  });
});
