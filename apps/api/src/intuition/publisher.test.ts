import pg from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { helpRequests, outboxEvents } from "../db/schema.js";
import { enqueueHelpRequestCreated, HELP_REQUEST_CREATED } from "./outbox.js";
import { processPendingOutboxEvents } from "./publisher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe.skipIf(!process.env.DATABASE_URL)(
  "intuition publisher",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await migrate(db, {
        migrationsFolder: path.join(__dirname, "../../drizzle"),
      });
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
      const stubLogs = logs.filter(
        (l) =>
          l.message === "intuition_publish_stub" &&
          l.meta?.helpRequestId === row.id,
      );
      expect(stubLogs).toHaveLength(1);
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
            l.message === "intuition_publish_stub" &&
            l.meta?.helpRequestId === row.id,
        ),
      ).toHaveLength(1);
    });

    it("skips stub publish when help request already published", async () => {
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
    });
  },
);
