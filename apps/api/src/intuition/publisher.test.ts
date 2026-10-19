import pg from "pg";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { helpRequests, outboxEvents } from "../db/schema.js";
import { ensureMigrated } from "../test/ensure-migrated.js";
import { enqueueHelpRequestCreated, HELP_REQUEST_CREATED } from "./outbox.js";
import { processPendingOutboxEvents } from "./publisher.js";
import { helpRequestExternalId } from "./sdk-client.js";

describe("processPendingOutboxEvents (mocked publish)", () => {
  function mockDb(options: {
    outboxEvents: Array<Record<string, unknown>>;
    helpRequest?: { intuitionPublishedAt: Date | null } | null;
    onUpdate?: () => void;
  }) {
    return {
      select: () => ({
        from: (table: unknown) => {
          const isOutbox = table === outboxEvents;
          return {
            where: () => {
              if (isOutbox) {
                return {
                  orderBy: () => ({
                    limit: () => Promise.resolve(options.outboxEvents),
                  }),
                };
              }
              return {
                limit: () =>
                  Promise.resolve(
                    options.helpRequest === undefined
                      ? [{ intuitionPublishedAt: null }]
                      : options.helpRequest
                        ? [options.helpRequest]
                        : [],
                  ),
              };
            },
          };
        },
      }),
      update: () => ({
        set: () => ({
          where: () => {
            options.onUpdate?.();
            return Promise.resolve();
          },
        }),
      }),
    } as never;
  }

  it("logs intuition_publish_sdk when publishFn returns sdk mode", async () => {
    const logs: Array<{ message: string; meta?: Record<string, unknown> }> =
      [];
    const publishFn = vi.fn().mockResolvedValue({
      mode: "sdk",
      externalId: helpRequestExternalId("00000000-0000-0000-0000-000000000099"),
      transactionHash: "0xmock",
      atomTermId: "0xterm",
      tripleCount: 3,
    });

    const db = mockDb({
      outboxEvents: [
        {
          id: "outbox-1",
          eventType: HELP_REQUEST_CREATED,
          aggregateId: "00000000-0000-0000-0000-000000000099",
          payload: {
            id: "00000000-0000-0000-0000-000000000099",
            title: "Mock publish",
            authorId: "bob@dev.local",
          },
          processedAt: null,
          createdAt: new Date(),
        },
      ],
    });

    await processPendingOutboxEvents(db, {
      log: (message, meta) => logs.push({ message, meta }),
      publishFn,
    });

    expect(publishFn).toHaveBeenCalledOnce();
    expect(logs.some((entry) => entry.message === "intuition_publish_sdk")).toBe(
      true,
    );
  });

  it("does not mark processed when publishFn throws", async () => {
    const logs: string[] = [];
    let updateCount = 0;
    const publishFn = vi.fn().mockRejectedValue(new Error("RPC unavailable"));

    const db = mockDb({
      outboxEvents: [
        {
          id: "outbox-2",
          eventType: HELP_REQUEST_CREATED,
          aggregateId: "00000000-0000-0000-0000-000000000002",
          payload: {
            id: "00000000-0000-0000-0000-000000000002",
            title: "Fail publish",
            authorId: "alice@dev.local",
          },
          processedAt: null,
          createdAt: new Date(),
        },
      ],
      onUpdate: () => {
        updateCount += 1;
      },
    });

    const result = await processPendingOutboxEvents(db, {
      log: (message) => logs.push(message),
      publishFn,
    });

    expect(result.publishErrors).toBe(1);
    expect(result.processed).toBe(0);
    expect(updateCount).toBe(0);
    expect(logs).toContain("intuition_publish_error");
  });
});

describe.skipIf(!process.env.DATABASE_URL)(
  "intuition publisher",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
    });

    afterAll(async () => {
      await pool.end();
    });

    it("enqueueHelpRequestCreated is idempotent per help request", async () => {
      const title = `Outbox idempotent ${Date.now()}`;
      const inserted = await db
        .insert(helpRequests)
        .values({ title, authorId: "bob@dev.local", tags: ["react"] })
        .returning();
      const row = inserted[0]!;
      const payload = {
        id: row.id,
        title: row.title,
        authorId: row.authorId,
        tags: row.tags,
      };

      const first = await enqueueHelpRequestCreated(db, payload);
      const second = await enqueueHelpRequestCreated(db, payload);
      expect(first.enqueued).toBe(true);
      expect(second.enqueued).toBe(false);

      const rows = await db
        .select()
        .from(outboxEvents)
        .where(eq(outboxEvents.aggregateId, row.id));
      expect(rows).toHaveLength(1);
      expect(rows[0]?.eventType).toBe(HELP_REQUEST_CREATED);

      await processPendingOutboxEvents(db);
    });

    it("processPendingOutboxEvents publishes once even if polled twice", async () => {
      const logs: Array<{ message: string; meta?: Record<string, unknown> }> =
        [];
      const log = (message: string, meta?: Record<string, unknown>) => {
        logs.push({ message, meta });
      };

      const title = `Publish once ${Date.now()}`;
      const inserted = await db
        .insert(helpRequests)
        .values({ title, authorId: "alice@dev.local", tags: [] })
        .returning();
      const row = inserted[0]!;
      await enqueueHelpRequestCreated(db, {
        id: row.id,
        title: row.title,
        authorId: row.authorId,
      });

      const first = await processPendingOutboxEvents(db, { log });
      const publishLogs = logs.filter(
        (l) =>
          (l.message === "intuition_publish_stub" ||
            l.message === "intuition_publish_sdk") &&
          l.meta?.helpRequestId === row.id,
      );
      expect(publishLogs).toHaveLength(1);
      expect(first.processed).toBeGreaterThanOrEqual(1);

      const [afterFirst] = await db
        .select()
        .from(helpRequests)
        .where(eq(helpRequests.id, row.id));
      expect(afterFirst?.intuitionPublishedAt).not.toBeNull();

      const second = await processPendingOutboxEvents(db, { log });
      expect(second.processed).toBe(0);
      expect(
        logs.filter(
          (l) =>
            (l.message === "intuition_publish_stub" ||
              l.message === "intuition_publish_sdk") &&
            l.meta?.helpRequestId === row.id,
        ),
      ).toHaveLength(1);
    });

    it("skips publish when help request already published", async () => {
      const logs: string[] = [];
      const title = `Already published ${Date.now()}`;
      const inserted = await db
        .insert(helpRequests)
        .values({
          title,
          authorId: "bob@dev.local",
          tags: [],
          intuitionPublishedAt: new Date(),
        })
        .returning();
      const row = inserted[0]!;

      await db.insert(outboxEvents).values({
        eventType: HELP_REQUEST_CREATED,
        aggregateId: row.id,
        payload: {
          id: row.id,
          title: row.title,
          authorId: row.authorId,
        },
      });

      const result = await processPendingOutboxEvents(db, {
        log: (message) => logs.push(message),
      });
      expect(result.skippedAlreadyPublished).toBe(1);
      expect(logs).not.toContain("intuition_publish_stub");
      expect(logs).not.toContain("intuition_publish_sdk");
    });
  },
);
