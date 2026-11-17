/**
 * Consumer of `certification.attested` (ADR 0009 §5): publishes each +1 on
 * Intuition testnet as `(person) expertIn (skill)` + `(claim) attestedBy (peer)`.
 *
 * Postgres stays the source of truth. Ids are deterministic, so a retry only
 * creates what is still missing on-chain.
 */
import {
  certificationAtoms,
  certificationTerms,
  type AtomTerm,
  type TripleTerm,
} from "@allaboard/blockchain";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import type { AppDatabase } from "../db/client.js";
import { certifications, outboxEvents, skills } from "../db/schema.js";
import type { IntuitionChain, TxReceipt } from "./chain.js";
import type { IntuitionPublisherLog } from "./publisher.js";

export const CERTIFICATION_ATTESTED_EVENT = "certification.attested" as const;

/** After this many failed attempts, the event waits for an admin replay. */
export const MAX_PUBLISH_ATTEMPTS = 8;

const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

/** 30 s, 1 min, 2 min… capped at 1 h. */
export function publishBackoffMs(attempts: number): number {
  return Math.min(BASE_BACKOFF_MS * 2 ** Math.max(0, attempts - 1), MAX_BACKOFF_MS);
}

export type CertificationPublishResult = {
  published: number;
  skippedRevoked: number;
  skippedAlreadyPublished: number;
  orphans: number;
  deferred: number;
  errors: number;
};

async function markProcessed(db: AppDatabase, outboxId: string, at: Date) {
  await db
    .update(outboxEvents)
    .set({ processedAt: at })
    .where(and(eq(outboxEvents.id, outboxId), isNull(outboxEvents.processedAt)));
}

async function createMissingAtoms(
  chain: IntuitionChain,
  atoms: AtomTerm[],
): Promise<TxReceipt | null> {
  const missing: AtomTerm[] = [];
  for (const atom of atoms) {
    if (!(await chain.isTermCreated(atom.id))) missing.push(atom);
  }
  if (missing.length === 0) return null;
  return chain.createAtoms(missing.map((atom) => atom.data));
}

async function createTripleIfMissing(
  chain: IntuitionChain,
  triple: TripleTerm,
): Promise<TxReceipt | null> {
  if (await chain.isTermCreated(triple.id)) return null;
  return chain.createTriples([triple]);
}

export async function processCertificationEvents(
  db: AppDatabase,
  chain: IntuitionChain,
  options: {
    profileOrigin: string;
    log?: IntuitionPublisherLog;
    now?: () => Date;
    batchSize?: number;
    /** Restrict to these certification ids (admin replay, tests). */
    onlyCertificationIds?: string[];
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
        eq(outboxEvents.eventType, CERTIFICATION_ATTESTED_EVENT),
        isNull(outboxEvents.processedAt),
        options.onlyCertificationIds
          ? inArray(outboxEvents.aggregateId, options.onlyCertificationIds)
          : undefined,
      ),
    )
    .orderBy(asc(outboxEvents.createdAt))
    .limit(options.batchSize ?? 20);

  for (const event of pending) {
    const [row] = await db
      .select({ certification: certifications, skill: skills })
      .from(certifications)
      .innerJoin(skills, eq(certifications.skillId, skills.id))
      .where(eq(certifications.id, event.aggregateId))
      .limit(1);

    if (!row) {
      await markProcessed(db, event.id, now());
      result.orphans += 1;
      log("certification_publish_orphan", { outboxId: event.id });
      continue;
    }
    const cert = row.certification;

    // Withdrawn before it reached the chain: never publish it (ADR 0009 §5).
    if (cert.revokedAt) {
      await markProcessed(db, event.id, now());
      result.skippedRevoked += 1;
      log("certification_publish_skipped_revoked", { certificationId: cert.id });
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
      const terms = certificationTerms({
        profileOrigin: options.profileOrigin,
        recipientId: cert.recipientId,
        attesterId: cert.attesterId,
        skillLabel: row.skill.label,
      });

      await createMissingAtoms(chain, certificationAtoms(terms));
      await createTripleIfMissing(chain, terms.claim);
      const attestationTx = await createTripleIfMissing(chain, terms.attestation);

      const publishedAt = now();
      await db
        .update(certifications)
        .set({
          claimTripleId: terms.claim.id,
          attestationTripleId: terms.attestation.id,
          // Null when the +1 already existed on-chain (a retry after a lost receipt).
          txHash: attestationTx?.hash ?? cert.txHash,
          publishedAt,
          publishError: null,
          nextPublishAt: null,
        })
        .where(eq(certifications.id, cert.id));
      if (!row.skill.intuitionAtomId) {
        await db
          .update(skills)
          .set({ intuitionAtomId: terms.skill.id })
          .where(eq(skills.id, row.skill.id));
      }
      await markProcessed(db, event.id, publishedAt);
      result.published += 1;
      log("certification_published", {
        certificationId: cert.id,
        attestationTripleId: terms.attestation.id,
        txHash: attestationTx?.hash ?? null,
      });
    } catch (err) {
      const attempts = cert.publishAttempts + 1;
      const message = (err instanceof Error ? err.message : String(err)).slice(0, 500);
      await db
        .update(certifications)
        .set({
          publishAttempts: attempts,
          publishError: message,
          nextPublishAt: new Date(now().getTime() + publishBackoffMs(attempts)),
        })
        .where(eq(certifications.id, cert.id));
      result.errors += 1;
      log("certification_publish_error", {
        certificationId: cert.id,
        attempts,
        error: message,
      });
    }
  }

  return result;
}
