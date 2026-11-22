import { randomUUID } from "node:crypto";
import pg from "pg";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { calculateAtomId, calculateTripleId } from "@0xintuition/ids";
import { certificationTerms } from "@allaboard/blockchain";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { defaultSeedSkills, seedSkills, seedUsers } from "../db/seed";
import {
  certifications,
  helpRequests,
  outboxEvents,
  responses,
  skills,
  users,
} from "../db/schema";
import { ensureMigrated } from "../test/ensure-migrated.js";
import type { IntuitionChain, TripleSpec } from "./chain";
import {
  CERTIFICATION_ATTESTED_EVENT,
  processCertificationEvents,
  publishBackoffMs,
} from "./certification-publisher";
import { refreshOperatorBalance } from "./publisher";
import {
  getCertificationPublisherStatus,
  setCertificationPublisherStatus,
} from "./publisher-status";

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

const ORIGIN = "https://dev.allaboard.fr";

/** In-memory MultiVault: deterministic ids, triples need existing terms. */
function fakeChain() {
  const terms = new Set<string>();
  const calls: { atoms: string[][]; triples: TripleSpec[][] } = {
    atoms: [],
    triples: [],
  };
  let failNext: string | null = null;
  let tx = 0;
  const chain: IntuitionChain = {
    operatorAddress: "0x0000000000000000000000000000000000000001",
    multiVaultAddress: "0x0000000000000000000000000000000000000002",
    async isTermCreated(id) {
      return terms.has(id);
    },
    async createAtoms(data) {
      if (failNext) {
        const message = failNext;
        failNext = null;
        throw new Error(message);
      }
      calls.atoms.push(data);
      for (const item of data) terms.add(calculateAtomId(item));
      tx += 1;
      return { hash: `0x${tx.toString(16).padStart(64, "0")}`, blockNumber: BigInt(tx) };
    },
    async createTriples(triples) {
      calls.triples.push(triples);
      for (const t of triples) {
        for (const id of [t.subjectId, t.predicateId, t.objectId]) {
          if (!terms.has(id)) throw new Error("MultiVault_TermDoesNotExist");
        }
        terms.add(calculateTripleId(t.subjectId, t.predicateId, t.objectId));
      }
      tx += 1;
      return { hash: `0x${tx.toString(16).padStart(64, "0")}`, blockNumber: BigInt(tx) };
    },
    async balance() {
      return "10";
    },
  };
  return {
    chain,
    calls,
    terms,
    failOnce(message: string) {
      failNext = message;
    },
  };
}

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "certification publisher (database)",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;
    let skill: { id: string; label: string };
    const run = randomUUID().slice(0, 8);

    async function createUser(name: string) {
      const email = `pub-${name}-${run}@test.local`;
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

    /** A +1 row and its pending outbox event, as the route writes them. */
    async function giveCertification(
      recipient: { id: string },
      attester: { id: string },
    ) {
      const [row] = await db
        .insert(certifications)
        .values({ recipientId: recipient.id, attesterId: attester.id, skillId: skill.id })
        .returning();
      await db.insert(outboxEvents).values({
        eventType: CERTIFICATION_ATTESTED_EVENT,
        aggregateId: row!.id,
        payload: { id: row!.id },
      });
      return row!;
    }

    async function loadCertification(id: string) {
      const [row] = await db
        .select()
        .from(certifications)
        .where(eq(certifications.id, id))
        .limit(1);
      return row!;
    }

    async function eventProcessedAt(id: string) {
      const [event] = await db
        .select({ processedAt: outboxEvents.processedAt })
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.eventType, CERTIFICATION_ATTESTED_EVENT),
            eq(outboxEvents.aggregateId, id),
          ),
        )
        .limit(1);
      return event!.processedAt;
    }

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
      await seedSkills(db, defaultSeedSkills());
      const [row] = await db
        .select({ id: skills.id, label: skills.label })
        .from(skills)
        .where(eq(skills.slug, "typescript"))
        .limit(1);
      skill = row!;
    });

    afterAll(async () => {
      await pool.end();
    });

    it("publishes atoms, claim and +1, then stores the ids", async () => {
      const recipient = await createUser("recipient");
      const attester = await createUser("attester");
      const cert = await giveCertification(recipient, attester);
      const { chain, calls, terms } = fakeChain();

      const result = await processCertificationEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [cert.id],
      });

      expect(result.published).toBe(1);
      const expected = certificationTerms({
        profileOrigin: ORIGIN,
        recipientId: recipient.id,
        attesterId: attester.id,
        skillLabel: skill.label,
      });
      // Predicates, both people and the skill in one batch, then the claim, then the +1.
      expect(calls.atoms).toHaveLength(1);
      expect(calls.atoms[0]).toHaveLength(5);
      expect(calls.triples.map((batch) => batch[0]!.subjectId)).toEqual([
        expected.recipient.id,
        expected.claim.id,
      ]);
      expect(terms.has(expected.attestation.id)).toBe(true);

      const saved = await loadCertification(cert.id);
      expect(saved.claimTripleId).toBe(expected.claim.id);
      expect(saved.attestationTripleId).toBe(expected.attestation.id);
      expect(saved.txHash).toMatch(/^0x[0-9a-f]{64}$/);
      expect(saved.publishedAt).not.toBeNull();
      expect(await eventProcessedAt(cert.id)).not.toBeNull();

      const [savedSkill] = await db
        .select({ atomId: skills.intuitionAtomId })
        .from(skills)
        .where(eq(skills.id, skill.id));
      expect(savedSkill!.atomId).toBe(expected.skill.id);
    });

    it("reuses existing atoms and claim for a second peer", async () => {
      const recipient = await createUser("shared");
      const first = await createUser("first");
      const second = await createUser("second");
      const a = await giveCertification(recipient, first);
      const b = await giveCertification(recipient, second);
      const { chain, calls } = fakeChain();

      await processCertificationEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [a.id],
      });
      calls.atoms.length = 0;
      calls.triples.length = 0;
      await processCertificationEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [b.id],
      });

      // Only the second peer's atom and the second +1 are new.
      expect(calls.atoms).toEqual([[`${ORIGIN}/u/${second.id}`]]);
      expect(calls.triples).toHaveLength(1);
      expect((await loadCertification(b.id)).claimTripleId).toBe(
        (await loadCertification(a.id)).claimTripleId,
      );
    });

    it("never publishes a +1 withdrawn before publication", async () => {
      const cert = await giveCertification(
        await createUser("rev-recipient"),
        await createUser("rev-attester"),
      );
      await db
        .update(certifications)
        .set({ revokedAt: new Date() })
        .where(eq(certifications.id, cert.id));
      const { chain, calls } = fakeChain();

      const result = await processCertificationEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [cert.id],
      });

      expect(result.skippedRevoked).toBe(1);
      expect(calls.atoms).toHaveLength(0);
      expect(calls.triples).toHaveLength(0);
      expect(await eventProcessedAt(cert.id)).not.toBeNull();
      expect((await loadCertification(cert.id)).publishedAt).toBeNull();
    });

    it("records an error, backs off, then publishes on retry", async () => {
      const cert = await giveCertification(
        await createUser("err-recipient"),
        await createUser("err-attester"),
      );
      const fake = fakeChain();
      fake.failOnce("rpc timeout");
      const t0 = new Date("2026-11-17T10:00:00Z");

      const first = await processCertificationEvents(db, fake.chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [cert.id],
        now: () => t0,
      });
      expect(first.errors).toBe(1);
      const failed = await loadCertification(cert.id);
      expect(failed.publishAttempts).toBe(1);
      expect(failed.publishError).toBe("rpc timeout");
      expect(failed.nextPublishAt!.getTime()).toBe(t0.getTime() + publishBackoffMs(1));
      expect(await eventProcessedAt(cert.id)).toBeNull();

      const early = await processCertificationEvents(db, fake.chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [cert.id],
        now: () => new Date(t0.getTime() + 1_000),
      });
      expect(early.deferred).toBe(1);

      const later = await processCertificationEvents(db, fake.chain, {
        profileOrigin: ORIGIN,
        onlyCertificationIds: [cert.id],
        now: () => new Date(t0.getTime() + publishBackoffMs(1) + 1),
      });
      expect(later.published).toBe(1);
      const published = await loadCertification(cert.id);
      expect(published.publishError).toBeNull();
      expect(published.nextPublishAt).toBeNull();
    });

    it("publishes a +1 given again after being withdrawn unpublished", async () => {
      const app = await buildApp({ pool, evaluateModeration: async () => true });
      try {
        const helper = await createUser("again-helper");
        const helped = await createUser("again-helped");
        const [request] = await db
          .insert(helpRequests)
          .values({ title: `Help ${randomUUID()}`, authorId: helped.id })
          .returning({ id: helpRequests.id });
        await db.insert(responses).values({
          helpRequestId: request!.id,
          body: "Here is how",
          authorId: helper.id,
        });
        const token = app.jwt.sign({ sub: helped.id });
        const give = () =>
          app.inject({
            method: "POST",
            url: `/users/${helper.id}/certifications`,
            headers: { authorization: `Bearer ${token}` },
            payload: { skillId: skill.id },
          });

        const created = await give();
        expect(created.statusCode).toBe(201);
        const { item } = JSON.parse(created.payload) as { item: { id: string } };
        const withdrawn = await app.inject({
          method: "DELETE",
          url: `/users/${helper.id}/certifications/${item.id}`,
          headers: { authorization: `Bearer ${token}` },
        });
        expect(withdrawn.statusCode).toBe(204);

        const fake = fakeChain();
        await processCertificationEvents(db, fake.chain, {
          profileOrigin: ORIGIN,
          onlyCertificationIds: [item.id],
        });
        expect(await eventProcessedAt(item.id)).not.toBeNull();

        expect((await give()).statusCode).toBe(201);
        expect(await eventProcessedAt(item.id)).toBeNull();

        const result = await processCertificationEvents(db, fake.chain, {
          profileOrigin: ORIGIN,
          onlyCertificationIds: [item.id],
        });
        expect(result.published).toBe(1);
        expect((await loadCertification(item.id)).publishedAt).not.toBeNull();
      } finally {
        await app.close();
      }
    });
  },
);

describe("publishBackoffMs", () => {
  it("doubles from 30 s and caps at 1 h", () => {
    expect(publishBackoffMs(1)).toBe(30_000);
    expect(publishBackoffMs(2)).toBe(60_000);
    expect(publishBackoffMs(20)).toBe(60 * 60 * 1000);
  });
});

describe("operator balance status", () => {
  it("flags a low balance once, and /health shows it without the address", async () => {
    let balance = "0.5";
    const chain = { ...fakeChain().chain, balance: async () => balance };
    const logs: string[] = [];
    const log = (message: string) => logs.push(message);
    const now = () => new Date("2026-11-18T10:00:00Z");

    await refreshOperatorBalance(chain, log, now);
    expect(getCertificationPublisherStatus()).toEqual({
      state: "on",
      operator: chain.operatorAddress,
      balance: "0.5",
      lowBalance: true,
      balanceCheckedAt: "2026-11-18T10:00:00.000Z",
    });
    await refreshOperatorBalance(chain, log, now);
    expect(logs).toEqual(["certification_publisher_low_balance"]);

    const app = await buildApp({ pool: null });
    const health = await app.inject({ method: "GET", url: "/health" });
    expect(JSON.parse(health.payload)).toEqual({
      status: "ok",
      certificationPublisher: "on",
      lowBalance: true,
    });
    await app.close();

    balance = "3";
    await refreshOperatorBalance(chain, log, now);
    expect(getCertificationPublisherStatus()).toMatchObject({ lowBalance: false });
    setCertificationPublisherStatus({ state: "off", reason: "test" });
  });

  it("keeps the last status when the balance read fails", async () => {
    setCertificationPublisherStatus({ state: "off", reason: "test" });
    const chain = {
      ...fakeChain().chain,
      balance: async (): Promise<string> => {
        throw new Error("rpc down");
      },
    };
    const logs: string[] = [];
    await refreshOperatorBalance(chain, (message) => logs.push(message));
    expect(logs).toEqual(["certification_publisher_balance_error"]);
    expect(getCertificationPublisherStatus()).toEqual({ state: "off", reason: "test" });
  });
});
