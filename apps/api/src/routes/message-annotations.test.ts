import { randomUUID } from "node:crypto";
import pg from "pg";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type {
  ChatSocketEvent,
  MessageAnnotationReplyResponse,
  MessageAnnotationResponse,
  MessageAnnotationsResponse,
  MessagesListResponse,
} from "@allaboard/types";

import { buildApp } from "../app";
import { seedUsers } from "../db/seed";
import { users } from "../db/schema";
import {
  resetChatBroadcastHub,
  subscribeToConversation,
} from "../services/chat-broadcast";
import { insertMessage } from "../services/conversations";
import { ensureMigrated } from "../test/ensure-migrated.js";

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "message annotations (database)",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;
    let app: Awaited<ReturnType<typeof buildApp>>;
    const run = randomUUID().slice(0, 8);
    let userCount = 0;

    async function createUser(name: string) {
      userCount += 1;
      const email = `annot-${name}-${userCount}-${run}@test.local`;
      await seedUsers(db, [
        { email, role: "student", password: seedPassword, fullName: `${name} ${run}` },
      ]);
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return row!;
    }

    async function call(
      user: { id: string },
      method: "GET" | "POST" | "PATCH" | "DELETE",
      url: string,
      payload?: Record<string, unknown>,
    ) {
      return app.inject({
        method,
        url,
        headers: { authorization: `Bearer ${app.jwt.sign({ sub: user.id })}` },
        ...(payload ? { payload } : {}),
      });
    }

    /** Two participants, one video message from `author` (12 s screen recording). */
    async function setup() {
      const author = await createUser("author");
      const viewer = await createUser("viewer");
      const conv = await call(author, "POST", "/conversations", {
        recipientId: viewer.id,
      });
      expect(conv.statusCode).toBe(201);
      const conversationId = (JSON.parse(conv.payload) as { item: { id: string } })
        .item.id;
      const video = await insertMessage(db as never, conversationId, author.id, {
        kind: "video",
        attachment: {
          key: `messages/${conversationId}/${randomUUID()}.webm`,
          mimeType: "video/webm",
          sizeBytes: 1024,
          durationMs: 12_000,
          source: "screen",
        },
      });
      const base = `/conversations/${conversationId}/messages/${video.id}/annotations`;
      return { author, viewer, conversationId, video, base };
    }

    function watch(conversationId: string): ChatSocketEvent[] {
      const events: ChatSocketEvent[] = [];
      subscribeToConversation(conversationId, {
        readyState: 1,
        send: (payload: string) => events.push(JSON.parse(payload) as ChatSocketEvent),
      } as never);
      return events;
    }

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
      app = await buildApp({ pool, evaluateModeration: async () => true });
    });

    beforeEach(() => {
      resetChatBroadcastHub();
    });

    afterAll(async () => {
      resetChatBroadcastHub();
      await app.close();
      await pool.end();
    });

    it("annotates a video at a timestamp with a rectangle, threads replies and tracks unread", async () => {
      const { author, viewer, conversationId, video, base } = await setup();
      expect(video.annotationCount).toBe(0);
      const events = watch(conversationId);

      const created = await call(viewer, "POST", base, {
        atMs: 4200,
        rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.25 },
        body: "What did you click here?",
      });
      expect(created.statusCode).toBe(201);
      const annotation = (JSON.parse(created.payload) as MessageAnnotationResponse).item;
      expect(annotation).toMatchObject({
        messageId: video.id,
        atMs: 4200,
        rect: { x: 0.1, y: 0.2, w: 0.3, h: 0.25 },
        body: "What did you click here?",
        replies: [],
      });
      expect(annotation.author.id).toBe(viewer.id);
      expect(events.at(-1)).toMatchObject({
        type: "annotation.created",
        messageId: video.id,
        annotation: { id: annotation.id },
      });

      const timestampOnly = await call(author, "POST", base, {
        atMs: 9000,
        body: "Note: the build step starts here.",
      });
      expect(timestampOnly.statusCode).toBe(201);
      expect(
        (JSON.parse(timestampOnly.payload) as MessageAnnotationResponse).item.rect,
      ).toBeUndefined();

      // The author sees one unread annotation (their own does not count).
      const listed = await call(author, "GET", base);
      expect(listed.statusCode).toBe(200);
      const list = JSON.parse(listed.payload) as MessageAnnotationsResponse;
      expect(list.items.map((a) => a.atMs)).toEqual([4200, 9000]);
      expect(list.unreadCount).toBe(1);

      const history = await call(author, "GET", `/conversations/${conversationId}/messages`);
      const videoInHistory = (JSON.parse(history.payload) as MessagesListResponse).items.find(
        (m) => m.id === video.id,
      );
      expect(videoInHistory).toMatchObject({ annotationCount: 2, unreadAnnotationCount: 1 });

      const read = await call(author, "PATCH", `${base}/read`);
      expect(read.statusCode).toBe(200);
      expect(
        (JSON.parse((await call(author, "GET", base)).payload) as MessageAnnotationsResponse)
          .unreadCount,
      ).toBe(0);

      // A reply from the author is unread for the viewer.
      const replied = await call(author, "POST", `/annotations/${annotation.id}/replies`, {
        body: "The Deploy button, top right.",
      });
      expect(replied.statusCode).toBe(201);
      const reply = (JSON.parse(replied.payload) as MessageAnnotationReplyResponse).item;
      expect(reply).toMatchObject({ annotationId: annotation.id, body: "The Deploy button, top right." });
      expect(events.at(-1)).toMatchObject({
        type: "annotation_reply.created",
        messageId: video.id,
        annotationId: annotation.id,
      });
      const viewerList = JSON.parse((await call(viewer, "GET", base)).payload) as MessageAnnotationsResponse;
      expect(viewerList.unreadCount).toBe(2);
      expect(viewerList.items[0]!.replies.map((r) => r.id)).toEqual([reply.id]);

      // Either participant resolves and reopens.
      const resolved = await call(viewer, "PATCH", `/annotations/${annotation.id}`, { resolved: true });
      expect(resolved.statusCode).toBe(200);
      expect((JSON.parse(resolved.payload) as MessageAnnotationResponse).item).toMatchObject({
        resolvedBy: viewer.id,
      });
      const reopened = await call(author, "PATCH", `/annotations/${annotation.id}`, { resolved: false });
      expect((JSON.parse(reopened.payload) as MessageAnnotationResponse).item.resolvedAt).toBeUndefined();
      expect(events.at(-1)).toMatchObject({ type: "annotation.updated" });
    });

    it("lets only the author edit or delete, and keeps replies after a soft delete", async () => {
      const { author, viewer, conversationId, base } = await setup();
      const annotation = (
        JSON.parse(
          (await call(viewer, "POST", base, { atMs: 1000, body: "Why this error?" })).payload,
        ) as MessageAnnotationResponse
      ).item;
      const reply = (
        JSON.parse(
          (await call(author, "POST", `/annotations/${annotation.id}/replies`, { body: "Missing env var." }))
            .payload,
        ) as MessageAnnotationReplyResponse
      ).item;

      expect(
        (await call(author, "PATCH", `/annotations/${annotation.id}`, { body: "Hijacked" })).statusCode,
      ).toBe(403);
      expect((await call(author, "DELETE", `/annotations/${annotation.id}`)).statusCode).toBe(403);
      expect(
        (await call(viewer, "PATCH", `/annotation-replies/${reply.id}`, { body: "Hijacked" })).statusCode,
      ).toBe(403);
      expect((await call(viewer, "DELETE", `/annotation-replies/${reply.id}`)).statusCode).toBe(403);

      const edited = await call(viewer, "PATCH", `/annotations/${annotation.id}`, { body: "Why this 500?" });
      expect(edited.statusCode).toBe(200);
      const editedItem = (JSON.parse(edited.payload) as MessageAnnotationResponse).item;
      expect(editedItem.body).toBe("Why this 500?");
      expect(editedItem.editedAt).toBeDefined();

      const replyEdited = await call(author, "PATCH", `/annotation-replies/${reply.id}`, {
        body: "Missing DATABASE_URL.",
      });
      expect((JSON.parse(replyEdited.payload) as MessageAnnotationReplyResponse).item.body).toBe(
        "Missing DATABASE_URL.",
      );

      const events = watch(conversationId);
      const deleted = await call(viewer, "DELETE", `/annotations/${annotation.id}`);
      expect(deleted.statusCode).toBe(200);
      const deletedItem = (JSON.parse(deleted.payload) as MessageAnnotationResponse).item;
      expect(deletedItem.body).toBeUndefined();
      expect(deletedItem.deletedAt).toBeDefined();
      expect(deletedItem.replies.map((r) => r.id)).toEqual([reply.id]);
      expect(events.at(-1)).toMatchObject({ type: "annotation.deleted" });

      expect(
        (await call(author, "POST", `/annotations/${annotation.id}/replies`, { body: "Late" })).statusCode,
      ).toBe(409);
      expect(
        (await call(viewer, "PATCH", `/annotations/${annotation.id}`, { resolved: true })).statusCode,
      ).toBe(409);

      const replyDeleted = await call(author, "DELETE", `/annotation-replies/${reply.id}`);
      expect((JSON.parse(replyDeleted.payload) as MessageAnnotationReplyResponse).item.body).toBeUndefined();

      const list = JSON.parse((await call(author, "GET", base)).payload) as MessageAnnotationsResponse;
      expect(list.items).toHaveLength(1);
      expect(list.unreadCount).toBe(0);
      const history = await call(author, "GET", `/conversations/${conversationId}/messages`);
      expect(
        (JSON.parse(history.payload) as MessagesListResponse).items.find((m) => m.kind === "video"),
      ).toMatchObject({ annotationCount: 0, unreadAnnotationCount: 0 });
    });

    it("rejects bad placements, non-video messages and outsiders", async () => {
      const { author, viewer, conversationId, video, base } = await setup();
      const outsider = await createUser("outsider");

      const after = await call(viewer, "POST", base, { atMs: 12_001, body: "After the end" });
      expect(JSON.parse(after.payload)).toEqual({ error: "invalid_timestamp" });
      const overflow = await call(viewer, "POST", base, {
        atMs: 0,
        rect: { x: 0.8, y: 0.1, w: 0.3, h: 0.1 },
        body: "Off the frame",
      });
      expect(JSON.parse(overflow.payload)).toEqual({ error: "invalid_rect" });
      for (const payload of [
        { atMs: 10, body: "   " },
        { atMs: -1, body: "Negative" },
        { atMs: 1.5, body: "Not an integer" },
        { atMs: 10, body: "x".repeat(1001) },
        { atMs: 10, body: "Unknown field", extra: true },
      ]) {
        const res = await call(viewer, "POST", base, payload);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.payload)).toEqual({ error: "invalid_body" });
      }

      const text = await insertMessage(db as never, conversationId, author.id, {
        kind: "text",
        body: "Plain text",
      });
      const onText = await call(
        viewer,
        "POST",
        `/conversations/${conversationId}/messages/${text.id}/annotations`,
        { atMs: 0, body: "Not a video" },
      );
      expect(JSON.parse(onText.payload)).toEqual({ error: "not_a_video_message" });

      const annotation = (
        JSON.parse((await call(viewer, "POST", base, { atMs: 500, body: "Fine" })).payload) as MessageAnnotationResponse
      ).item;

      expect((await call(outsider, "GET", base)).statusCode).toBe(403);
      expect((await call(outsider, "POST", base, { atMs: 1, body: "Hi" })).statusCode).toBe(403);
      expect(
        (await call(outsider, "PATCH", `/annotations/${annotation.id}`, { resolved: true })).statusCode,
      ).toBe(404);
      expect(
        (await call(outsider, "POST", `/annotations/${annotation.id}/replies`, { body: "Hi" })).statusCode,
      ).toBe(404);
      expect((await call(viewer, "GET", `/conversations/${conversationId}/messages/not-a-uuid/annotations`)).statusCode).toBe(404);
      expect(
        (await call(viewer, "GET", `/conversations/${conversationId}/messages/${randomUUID()}/annotations`)).statusCode,
      ).toBe(404);
      expect((await call(viewer, "PATCH", `/annotations/not-a-uuid`, { resolved: true })).statusCode).toBe(404);
      expect((await call(viewer, "DELETE", `/annotation-replies/${randomUUID()}`)).statusCode).toBe(404);
      expect(video.id).toBeDefined();
    });
  },
);
