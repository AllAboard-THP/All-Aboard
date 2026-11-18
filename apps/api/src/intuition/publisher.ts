import { and, asc, eq, isNull } from "drizzle-orm";
import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, outboxEvents } from "../db/schema.js";
import { createIntuitionChain, type IntuitionChain } from "./chain.js";
import { processCertificationEvents } from "./certification-publisher.js";
import { loadIntuitionConfig, type IntuitionConfig } from "./config.js";
import { HELP_REQUEST_CREATED } from "./outbox.js";
import {
  publishHelpRequestCreatedToIntuition,
  type PublishHelpRequestResult,
} from "./stub-publisher.js";

export type IntuitionPublisherLog = (
  message: string,
  meta?: Record<string, unknown>,
) => void;

export type ProcessOutboxResult = {
  processed: number;
  skippedAlreadyPublished: number;
  publishErrors: number;
};

export type PublishHelpRequestFn = (
  payload: HelpRequestCreatedOutboxPayload,
  config: IntuitionConfig,
) => Promise<PublishHelpRequestResult>;

const DEFAULT_BATCH = 50;

function logPublishResult(
  result: PublishHelpRequestResult,
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
    externalId: result.externalId,
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
    publishFn?: PublishHelpRequestFn;
  },
): Promise<ProcessOutboxResult> {
  const config = options?.config ?? loadIntuitionConfig();
  const log = options?.log ?? (() => {});
  const now = options?.now ?? (() => new Date());
  const batchSize = options?.batchSize ?? DEFAULT_BATCH;
  const publishFn =
    options?.publishFn ?? publishHelpRequestCreatedToIntuition;

  const pending = await db
    .select()
    .from(outboxEvents)
    .where(
      and(
        eq(outboxEvents.eventType, HELP_REQUEST_CREATED),
        isNull(outboxEvents.processedAt),
      ),
    )
    .orderBy(asc(outboxEvents.createdAt))
    .limit(batchSize);

  let processed = 0;
  let skippedAlreadyPublished = 0;
  let publishErrors = 0;

  for (const event of pending) {
    const payload = event.payload as HelpRequestCreatedOutboxPayload;
    const [request] = await db
      .select({
        intuitionStubAckedAt: helpRequests.intuitionStubAckedAt,
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

    if (request.intuitionStubAckedAt) {
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

    let publishResult: PublishHelpRequestResult;
    try {
      publishResult = await publishFn(payload, config);
      logPublishResult(publishResult, payload, config, log);
    } catch (err) {
      publishErrors += 1;
      log("intuition_publish_error", {
        outboxId: event.id,
        helpRequestId: payload.id,
        error: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    const publishedAt = now();
    await db
      .update(helpRequests)
      .set({ intuitionStubAckedAt: publishedAt })
      .where(
        and(
          eq(helpRequests.id, event.aggregateId),
          isNull(helpRequests.intuitionStubAckedAt),
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

  return { processed, skippedAlreadyPublished, publishErrors };
}

export type IntuitionPublisherHandle = {
  stop: () => void;
};

/**
 * Certification consumer, or null when it must stay off: no operator key or
 * no profile origin. Events then wait in the outbox (ADR 0009 §1).
 */
export function createCertificationChain(
  config: IntuitionConfig,
  log: IntuitionPublisherLog,
): IntuitionChain | null {
  if (!config.publisherPrivateKey) {
    log("certification_publisher_off", { reason: "no INTUITION_PUBLISHER_PRIVATE_KEY" });
    return null;
  }
  if (!config.profileOrigin) {
    log("certification_publisher_off", { reason: "no INTUITION_PROFILE_ORIGIN" });
    return null;
  }
  try {
    return createIntuitionChain({
      privateKey: config.publisherPrivateKey,
      rpcUrl: config.rpcUrl,
      networkId: config.networkId,
    });
  } catch (err) {
    // Never log the key; only the reason.
    log("certification_publisher_off", {
      reason: err instanceof Error ? err.message : "invalid configuration",
    });
    return null;
  }
}

export function startIntuitionPublisher(
  db: AppDatabase,
  options?: { log?: IntuitionPublisherLog; chain?: IntuitionChain | null },
): IntuitionPublisherHandle | null {
  const config = loadIntuitionConfig();
  if (!config.publisherEnabled) return null;

  const log = options?.log ?? ((message, meta) => {
    console.log(`[intuition-publisher] ${message}`, meta ?? "");
  });

  const chain =
    options?.chain !== undefined
      ? options.chain
      : createCertificationChain(config, log);
  if (chain) {
    void chain
      .balance()
      .then((balance) =>
        log("certification_publisher_on", {
          operator: chain.operatorAddress,
          balance,
          lowBalance: Number(balance) < 1,
        }),
      )
      .catch((err: unknown) =>
        log("certification_publisher_balance_error", {
          error: err instanceof Error ? err.message : String(err),
        }),
      );
  }

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await processPendingOutboxEvents(db, { config, log });
      if (chain && config.profileOrigin) {
        await processCertificationEvents(db, chain, {
          profileOrigin: config.profileOrigin,
          log,
        });
      }
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
