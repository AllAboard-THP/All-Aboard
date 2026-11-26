import type { HelpRequestCreatedOutboxPayload } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { outboxEvents } from "../db/schema.js";

export const HELP_REQUEST_CREATED = "help_request.created" as const;
export const HELP_REQUEST_SUMMARY_REQUESTED =
  "help_request.summary_requested" as const;

export async function enqueueHelpRequestCreated(
  db: AppDatabase,
  payload: HelpRequestCreatedOutboxPayload,
): Promise<{ enqueued: boolean }> {
  const rows = await db
    .insert(outboxEvents)
    .values({
      eventType: HELP_REQUEST_CREATED,
      aggregateId: payload.id,
      payload,
    })
    .onConflictDoNothing({
      target: [outboxEvents.eventType, outboxEvents.aggregateId],
    })
    .returning({ id: outboxEvents.id });
  return { enqueued: rows.length > 0 };
}

export async function enqueueHelpRequestSummaryRequested(
  db: AppDatabase,
  helpRequestId: string,
): Promise<{ enqueued: boolean }> {
  const rows = await db
    .insert(outboxEvents)
    .values({
      eventType: HELP_REQUEST_SUMMARY_REQUESTED,
      aggregateId: helpRequestId,
      payload: { id: helpRequestId },
    })
    .onConflictDoNothing({
      target: [outboxEvents.eventType, outboxEvents.aggregateId],
    })
    .returning({ id: outboxEvents.id });
  return { enqueued: rows.length > 0 };
}
