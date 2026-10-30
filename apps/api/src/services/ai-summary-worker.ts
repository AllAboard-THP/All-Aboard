import { and, asc, eq, isNull } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { helpRequests, outboxEvents, responses, users } from "../db/schema.js";
import {
  createSummaryGenerator,
  type GenerateSummaryFn,
} from "../agent/summary.js";
import { displayNameFromUser } from "../lib/user-mappers.js";
import { HELP_REQUEST_SUMMARY_REQUESTED } from "../intuition/outbox.js";

export type AiSummaryWorkerLog = (
  message: string,
  meta?: Record<string, unknown>,
) => void;

const DEFAULT_BATCH = 20;
const DEFAULT_POLL_MS = 5_000;

export async function processPendingSummaryEvents(
  db: AppDatabase,
  options?: {
    batchSize?: number;
    generateSummary?: GenerateSummaryFn;
    log?: AiSummaryWorkerLog;
    now?: () => Date;
  },
): Promise<{ processed: number }> {
  const log = options?.log ?? (() => {});
  const now = options?.now ?? (() => new Date());
  const batchSize = options?.batchSize ?? DEFAULT_BATCH;
  const generateSummary =
    options?.generateSummary ?? createSummaryGenerator();

  const pending = await db
    .select()
    .from(outboxEvents)
    .where(
      and(
        eq(outboxEvents.eventType, HELP_REQUEST_SUMMARY_REQUESTED),
        isNull(outboxEvents.processedAt),
      ),
    )
    .orderBy(asc(outboxEvents.createdAt))
    .limit(batchSize);

  let processed = 0;

  for (const event of pending) {
    const helpRequestId = event.aggregateId;
    const [request] = await db
      .select()
      .from(helpRequests)
      .where(eq(helpRequests.id, helpRequestId))
      .limit(1);

    if (!request || request.status !== "resolved") {
      await db
        .update(outboxEvents)
        .set({ processedAt: now() })
        .where(eq(outboxEvents.id, event.id));
      processed += 1;
      continue;
    }

    if (request.aiSummary?.trim()) {
      await db
        .update(outboxEvents)
        .set({ processedAt: now() })
        .where(eq(outboxEvents.id, event.id));
      processed += 1;
      continue;
    }

    const responseRows = await db
      .select({ response: responses, user: users })
      .from(responses)
      .innerJoin(users, eq(responses.authorId, users.email))
      .where(eq(responses.helpRequestId, helpRequestId))
      .orderBy(asc(responses.createdAt));

    const { summary } = await generateSummary({
      title: request.title,
      body: request.body,
      codeSnippet: request.codeSnippet ?? undefined,
      responses: responseRows.map((row) => ({
        authorName: displayNameFromUser(row.user),
        body: row.response.body,
      })),
    });

    await db
      .update(helpRequests)
      .set({ aiSummary: summary, updatedAt: now() })
      .where(eq(helpRequests.id, helpRequestId));

    await db
      .update(outboxEvents)
      .set({ processedAt: now() })
      .where(eq(outboxEvents.id, event.id));

    log("ai_summary_generated", { helpRequestId });
    processed += 1;
  }

  return { processed };
}

export type AiSummaryWorkerHandle = {
  stop: () => void;
};

export function isAiSummaryWorkerEnabled(): boolean {
  const raw = process.env.AI_SUMMARY_ENABLED?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function startAiSummaryWorker(
  db: AppDatabase,
  options?: { log?: AiSummaryWorkerLog; pollMs?: number },
): AiSummaryWorkerHandle | null {
  if (!isAiSummaryWorkerEnabled()) return null;

  const log = options?.log ?? ((message, meta) => {
    console.log(`[ai-summary-worker] ${message}`, meta ?? "");
  });
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await processPendingSummaryEvents(db, { log });
    } catch (err) {
      log("ai_summary_worker_error", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      running = false;
    }
  };

  void tick();
  const timer = setInterval(() => {
    void tick();
  }, pollMs);
  timer.unref?.();

  return { stop: () => clearInterval(timer) };
}
