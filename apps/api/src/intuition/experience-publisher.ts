/**
 * Consumer of `experience.attested` (ADR 0010 §4): publishes each mission
 * validation as `(person) contributedTo (mission)` + `(claim) attestedBy (mentor)`.
 *
 * Same flow as the skill +1 consumer: Postgres is the source of truth, ids
 * are deterministic, so a retry only creates what is still missing on-chain.
 */
import { experienceAtoms, experienceTerms } from "@allaboard/blockchain";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { experienceCertifications, outboxEvents } from "../db/schema.js";
import type { IntuitionChain } from "./chain.js";
import {
  createMissingAtoms,
  createTripleIfMissing,
  markProcessed,
  MAX_PUBLISH_ATTEMPTS,
  publishBackoffMs,
  type CertificationPublishResult,
} from "./certification-publisher.js";
import type { IntuitionPublisherLog } from "./publisher.js";

export const EXPERIENCE_ATTESTED_EVENT = "experience.attested" as const;

export async function processExperienceEvents(
  db: AppDatabase,
  chain: IntuitionChain,
  options: {
    profileOrigin: string;
    log?: IntuitionPublisherLog;
    now?: () => Date;
    batchSize?: number;
    /** Restrict to these experience certification ids (admin replay, tests). */
    onlyIds?: string[];
  },
): Promise<CertificationPublishResult> {
  const log = options.log ?? (() => {});
  const now = options.now ?? (() => new Date());
  const result: CertificationPublishResult = {
    published: 0,
    skippedRevoked: 0,
    skippedAlreadyPublished: 0,
    orphans: 0,
    deferred: 0,
    errors: 0,
  };

  const pending = await db
    .select()
    .from(outboxEvents)
    .where(
      and(
        eq(outboxEvents.eventType, EXPERIENCE_ATTESTED_EVENT),
        isNull(outboxEvents.processedAt),
        options.onlyIds ? inArray(outboxEvents.aggregateId, options.onlyIds) : undefined,
      ),
    )
    .orderBy(asc(outboxEvents.createdAt))
    .limit(options.batchSize ?? 20);

  for (const event of pending) {
    const [cert] = await db
      .select()
      .from(experienceCertifications)
      .where(eq(experienceCertifications.id, event.aggregateId))
      .limit(1);

    if (!cert) {
      await markProcessed(db, event.id, now());
      result.orphans += 1;
      log("experience_publish_orphan", { outboxId: event.id });
      continue;
    }
    // Withdrawn before it reached the chain: never publish it (ADR 0010 §5).
    if (cert.revokedAt) {
      await markProcessed(db, event.id, now());
      result.skippedRevoked += 1;
      log("experience_publish_skipped_revoked", { experienceId: cert.id });
      continue;
    }
    if (cert.publishedAt) {
      await markProcessed(db, event.id, now());
      result.skippedAlreadyPublished += 1;
      continue;
    }
    if (cert.publishAttempts >= MAX_PUBLISH_ATTEMPTS) {
      result.deferred += 1;
      continue;
    }
    if (cert.nextPublishAt && cert.nextPublishAt > now()) {
      result.deferred += 1;
      continue;
    }

    try {
      const terms = experienceTerms({
        profileOrigin: options.profileOrigin,
        missionId: cert.missionId,
        recipientId: cert.recipientId,
        attesterId: cert.attesterId,
      });

      await createMissingAtoms(chain, experienceAtoms(terms));
      await createTripleIfMissing(chain, terms.claim);
      const attestationTx = await createTripleIfMissing(chain, terms.attestation);

      const publishedAt = now();
      await db
        .update(experienceCertifications)
        .set({
          claimTripleId: terms.claim.id,
          attestationTripleId: terms.attestation.id,
          txHash: attestationTx?.hash ?? cert.txHash,
          publishedAt,
          publishError: null,
          nextPublishAt: null,
        })
        .where(eq(experienceCertifications.id, cert.id));
      await markProcessed(db, event.id, publishedAt);
      result.published += 1;
      log("experience_published", {
        experienceId: cert.id,
        attestationTripleId: terms.attestation.id,
        txHash: attestationTx?.hash ?? null,
      });
    } catch (err) {
      const attempts = cert.publishAttempts + 1;
      const message = (err instanceof Error ? err.message : String(err)).slice(0, 500);
      await db
        .update(experienceCertifications)
        .set({
          publishAttempts: attempts,
          publishError: message,
          nextPublishAt: new Date(now().getTime() + publishBackoffMs(attempts)),
        })
        .where(eq(experienceCertifications.id, cert.id));
      result.errors += 1;
      log("experience_publish_error", { experienceId: cert.id, attempts, error: message });
    }
  }

  return result;
}
