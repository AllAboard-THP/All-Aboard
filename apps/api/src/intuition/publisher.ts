import { and, asc, eq, isNull } from "drizzle-orm";
import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, outboxEvents } from "../db/schema.js";
import { loadIntuitionConfig, type IntuitionConfig } from "./config.js";
import { HELP_REQUEST_CREATED } from "./outbox.js";

export type IntuitionPublisherLog = (
  message: string,
  meta?: Record<string, unknown>,
) => void;

export type ProcessOutboxResult = {
  processed: number;
  skippedAlreadyPublished: number;
};

const DEFAULT_BATCH = 50;

function stubPublishHelpRequestCreated(
  payload: HelpRequestCreatedOutboxPayload,
  config: IntuitionConfig,
  log: IntuitionPublisherLog,
): void {
  log("intuition_publish_stub", {
    eventType: HELP_REQUEST_CREATED,
    helpRequestId: payload.id,
    title: payload.title,
    authorId: payload.authorId,
    tags: payload.tags ?? [],
    networkId: config.networkId,
    rpcConfigured: Boolean(config.rpcUrl),
    graphqlConfigured: Boolean(config.graphqlUrl),
  });
}

export async function processPendingOutboxEvents(
  db: AppDatabase,
  options?: {
    batchSize?: number;
    config?: IntuitionConfig;
    log?: IntuitionPublisherLog;
    now?: () => Date;
  },
): Promise<ProcessOutboxResult> {
  const config = options?.config ?? loadIntuitionConfig();
  const log = options?.log ?? (() => {});
  const now = options?.now ?? (() => new Date());
  const batchSize = options?.batchSize ?? DEFAULT_BATCH;

  const pending = await db
    .select()
    .from(outboxEvents)
    .where(isNull(outboxEvents.processedAt))
    .orderBy(asc(outboxEvents.createdAt))
    .limit(batchSize);

  let processed = 0;
  let skippedAlreadyPublished = 0;

  for (const event of pending) {
    if (event.eventType !== HELP_REQUEST_CREATED) {
      await db
        .update(outboxEvents)
        .set({ processedAt: now() })
        .where(eq(outboxEvents.id, event.id));
      processed += 1;
      continue;
    }

    const payload = event.payload as HelpRequestCreatedOutboxPayload;
    const [request] = await db
      .select({
        intuitionPublishedAt: helpRequests.intuitionPublishedAt,
      })
      .from(helpRequests)
      .where(eq(helpRequests.id, event.aggregateId))
      .limit(1);

    if (!request) {
      await db
        .update(outboxEvents)
        .set({ processedAt: now() })
        .where(eq(outboxEvents.id, event.id));
      processed += 1;
      log("intuition_outbox_orphan", {
        outboxId: event.id,
        aggregateId: event.aggregateId,
      });
      continue;
    }

    if (request.intuitionPublishedAt) {
      await db
        .update(outboxEvents)
        .set({ processedAt: now() })
        .where(
          and(
            eq(outboxEvents.id, event.id),
            isNull(outboxEvents.processedAt),
          ),
        );
      skippedAlreadyPublished += 1;
      processed += 1;
      continue;
    }

    stubPublishHelpRequestCreated(payload, config, log);

    const publishedAt = now();
    await db
      .update(helpRequests)
      .set({ intuitionPublishedAt: publishedAt })
      .where(
        and(
          eq(helpRequests.id, event.aggregateId),
          isNull(helpRequests.intuitionPublishedAt),
        ),
      );

    await db
      .update(outboxEvents)
      .set({ processedAt: publishedAt })
      .where(
        and(eq(outboxEvents.id, event.id), isNull(outboxEvents.processedAt)),
      );

    processed += 1;
  }

  return { processed, skippedAlreadyPublished };
}

export type IntuitionPublisherHandle = {
  stop: () => void;
};

export function startIntuitionPublisher(
  db: AppDatabase,
  options?: { log?: IntuitionPublisherLog },
): IntuitionPublisherHandle | null {
  const config = loadIntuitionConfig();
  if (!config.publisherEnabled) return null;

  const log = options?.log ?? ((message, meta) => {
    console.log(`[intuition-publisher] ${message}`, meta ?? "");
  });

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await processPendingOutboxEvents(db, { config, log });
    } catch (err) {
      log("intuition_publisher_error", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      running = false;
    }
  };

  void tick();
  const timer = setInterval(() => {
    void tick();
  }, config.publisherPollMs);
  timer.unref?.();

  return {
    stop: () => clearInterval(timer),
  };
}
