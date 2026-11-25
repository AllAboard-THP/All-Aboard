import { randomUUID } from "node:crypto";
import pg from "pg";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { calculateAtomId, calculateTripleId } from "@0xintuition/ids";
import { experienceTerms } from "@allaboard/blockchain";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type {
  MissionApplicationResponse,
  MissionResponse,
  MissionsResponse,
  MyMissionApplicationsResponse,
  MyMissionsResponse,
  UserExperiencesResponse,
} from "@allaboard/types";
import { buildApp } from "../app";
import { defaultSeedSkills, seedSkills, seedUsers } from "../db/seed";
import {
  experienceCertifications,
  missions,
  outboxEvents,
  skills,
  users,
} from "../db/schema";
import { ensureMigrated } from "../test/ensure-migrated.js";
import type { IntuitionChain } from "../intuition/chain";
import {
  EXPERIENCE_ATTESTED_EVENT,
  processExperienceEvents,
} from "../intuition/experience-publisher";
import { EXPERIENCE_ATTESTED } from "./missions";

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

const ORIGIN = "https://dev.allaboard.fr";

/** In-memory MultiVault: deterministic ids, triples need existing terms. */
function fakeChain() {
  const terms = new Set<string>();
  let tx = 0;
  const receipt = () => {
    tx += 1;
    return { hash: `0x${tx.toString(16).padStart(64, "0")}`, blockNumber: BigInt(tx) };
  };
  const chain: IntuitionChain = {
    operatorAddress: "0x0000000000000000000000000000000000000001",
    multiVaultAddress: "0x0000000000000000000000000000000000000002",
    async isTermCreated(id) {
      return terms.has(id);
    },
    async createAtoms(data) {
      for (const item of data) terms.add(calculateAtomId(item));
      return receipt();
    },
    async createTriples(triples) {
      for (const t of triples) {
        for (const id of [t.subjectId, t.predicateId, t.objectId]) {
          if (!terms.has(id)) throw new Error("MultiVault_TermDoesNotExist");
        }
        terms.add(calculateTripleId(t.subjectId, t.predicateId, t.objectId));
      }
      return receipt();
    },
    async balance() {
      return "10";
    },
  };
  return { chain, terms };
}

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "missions (database)",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;
    let app: Awaited<ReturnType<typeof buildApp>>;
    let skillId: string;
    const run = randomUUID().slice(0, 8);

    async function createUser(name: string, role: "student" | "mentor" = "student") {
      const email = `mission-${name}-${run}@test.local`;
      await seedUsers(db, [
        { email, role, password: seedPassword, fullName: `${name} ${run}` },
      ]);
      const [row] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return row!;
    }

    function auth(user: { id: string }) {
      return { authorization: `Bearer ${app.jwt.sign({ sub: user.id })}` };
    }

    async function call(
      user: { id: string } | null,
      method: "GET" | "POST" | "PATCH" | "DELETE",
      url: string,
      payload?: Record<string, unknown>,
    ) {
      return app.inject({
        method,
        url,
        headers: user ? auth(user) : {},
        ...(payload ? { payload } : {}),
      });
    }

    async function createMission(
      mentor: { id: string },
      overrides: Record<string, unknown> = {},
    ) {
      const res = await call(mentor, "POST", "/missions", {
        kind: "personal_project",
        title: `Add auth to my side project ${run}`,
        description: "Passkeys on a small Next.js app, with tests.",
        githubRepoUrl: "https://github.com/allaboard-demo/side-project",
        places: 2,
        skillIds: [skillId],
        ...overrides,
      });
      expect(res.statusCode).toBe(201);
      return (JSON.parse(res.payload) as MissionResponse).item;
    }

    async function apply(user: { id: string }, missionId: string) {
      const res = await call(user, "POST", `/missions/${missionId}/applications`, {
        message: "I have shipped passkeys before.",
      });
      expect(res.statusCode).toBe(201);
      return (JSON.parse(res.payload) as MissionApplicationResponse).item;
    }

    async function decide(
      mentor: { id: string },
      missionId: string,
      applicationId: string,
      decision: "accepted" | "rejected",
    ) {
      return call(
        mentor,
        "POST",
        `/missions/${missionId}/applications/${applicationId}/decision`,
        { decision },
      );
    }

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
      await seedSkills(db, defaultSeedSkills());
      const [row] = await db
        .select({ id: skills.id })
        .from(skills)
        .where(eq(skills.slug, "typescript"))
        .limit(1);
      skillId = row!.id;
      app = await buildApp({ pool, evaluateModeration: async () => true });
    });

    afterAll(async () => {
      await app.close();
      await pool.end();
    });

    it("only mentors post missions, and the list filters by type and skill", async () => {
      const mentor = await createUser("mentor", "mentor");
      const student = await createUser("student");

      const refused = await call(student, "POST", "/missions", {
        kind: "freelance",
        title: "Not allowed",
        description: "Students cannot post missions.",
      });
      expect(refused.statusCode).toBe(403);
      expect(JSON.parse(refused.payload)).toEqual({ error: "mentor_only" });

      const mission = await createMission(mentor, {
        kind: "hackathon",
        compensation: "Prizes for the top three teams",
      });
      expect(mission.status).toBe("open");
      expect(mission.skills.map((s) => s.slug)).toEqual(["typescript"]);
      expect(mission.author.id).toBe(mentor.id);
      expect(mission.compensation).toBe("Prizes for the top three teams");

      const list = await call(student, "GET", "/missions?kind=hackathon&skill=typescript");
      expect(list.statusCode).toBe(200);
      const ids = (JSON.parse(list.payload) as MissionsResponse).items.map((m) => m.id);
      expect(ids).toContain(mission.id);

      const other = await call(student, "GET", "/missions?kind=freelance");
      expect(
        (JSON.parse(other.payload) as MissionsResponse).items.map((m) => m.id),
      ).not.toContain(mission.id);

      expect((await call(null, "GET", "/missions")).statusCode).toBe(401);
    });

    it("rejects a bad GitHub URL and flagged content", async () => {
      const mentor = await createUser("strict", "mentor");
      const badUrl = await call(mentor, "POST", "/missions", {
        kind: "personal_project",
        title: "Bad repo link",
        description: "The repository link is not a GitHub repository.",
        githubRepoUrl: "https://gitlab.com/someone/repo",
      });
      expect(badUrl.statusCode).toBe(400);

      const flagged = await call(mentor, "POST", "/missions", {
        kind: "personal_project",
        title: "fuck this mission",
        description: "A description long enough to pass the schema.",
      });
      expect(flagged.statusCode).toBe(422);
      expect(JSON.parse(flagged.payload)).toEqual({ error: "content_rejected" });
    });

    it("runs the whole journey: apply, accept, deliver, validate, profile", async () => {
      const mentor = await createUser("author", "mentor");
      const alice = await createUser("alice");
      const bob = await createUser("bob");
      const carol = await createUser("carol");
      const mission = await createMission(mentor, { places: 2 });

      // The author cannot apply to their own mission.
      const own = await call(mentor, "POST", `/missions/${mission.id}/applications`, {
        message: "Me",
      });
      expect(own.statusCode).toBe(400);

      const aliceApp = await apply(alice, mission.id);
      const bobApp = await apply(bob, mission.id);
      const carolApp = await apply(carol, mission.id);
      expect(aliceApp.status).toBe("pending");

      const again = await call(alice, "POST", `/missions/${mission.id}/applications`, {
        message: "Twice",
      });
      expect(again.statusCode).toBe(409);

      // Only the author decides.
      expect((await decide(alice, mission.id, bobApp.id, "accepted")).statusCode).toBe(403);

      expect((await decide(mentor, mission.id, aliceApp.id, "accepted")).statusCode).toBe(200);
      expect((await decide(mentor, mission.id, bobApp.id, "accepted")).statusCode).toBe(200);
      const full = await decide(mentor, mission.id, carolApp.id, "accepted");
      expect(full.statusCode).toBe(409);
      expect(JSON.parse(full.payload)).toEqual({ error: "mission_full" });
      expect((await decide(mentor, mission.id, carolApp.id, "rejected")).statusCode).toBe(200);

      // Places cannot drop under the accepted count.
      const shrink = await call(mentor, "PATCH", `/missions/${mission.id}`, { places: 1 });
      expect(shrink.statusCode).toBe(409);

      // Alice attaches her pull request; Bob cannot edit Alice's application.
      const deliverable = "https://github.com/allaboard-demo/side-project/pull/12";
      expect(
        (
          await call(bob, "PATCH", `/missions/${mission.id}/applications/${aliceApp.id}`, {
            deliverableUrl: deliverable,
          })
        ).statusCode,
      ).toBe(403);
      const delivered = await call(
        alice,
        "PATCH",
        `/missions/${mission.id}/applications/${aliceApp.id}`,
        { deliverableUrl: deliverable },
      );
      expect(delivered.statusCode).toBe(200);

      // Rejected applicants cannot be validated.
      const notAccepted = await call(
        mentor,
        "POST",
        `/missions/${mission.id}/applications/${carolApp.id}/validate`,
        {},
      );
      expect(notAccepted.statusCode).toBe(409);

      const validated = await call(
        mentor,
        "POST",
        `/missions/${mission.id}/applications/${aliceApp.id}/validate`,
        { comment: "Clean work, well tested." },
      );
      expect(validated.statusCode).toBe(201);
      const validatedItem = (JSON.parse(validated.payload) as MissionApplicationResponse).item;
      expect(validatedItem.validation?.comment).toBe("Clean work, well tested.");
      expect(validatedItem.validation?.proof).toBeUndefined();

      const twice = await call(
        mentor,
        "POST",
        `/missions/${mission.id}/applications/${aliceApp.id}/validate`,
        {},
      );
      expect(twice.statusCode).toBe(409);

      // The validation enqueued experience.attested and moved the mission on.
      const [event] = await db
        .select()
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.eventType, EXPERIENCE_ATTESTED),
            eq(outboxEvents.aggregateId, validatedItem.validation!.id),
          ),
        );
      expect(event?.processedAt).toBeNull();
      const [missionRow] = await db.select().from(missions).where(eq(missions.id, mission.id));
      expect(missionRow?.status).toBe("in_progress");

      // Dashboard, both sides.
      const board = JSON.parse(
        (await call(mentor, "GET", "/me/missions")).payload,
      ) as MyMissionsResponse;
      const entry = board.items.find((i) => i.mission.id === mission.id)!;
      expect(entry.mission.acceptedCount).toBe(2);
      expect(entry.applications.map((a) => a.status).sort()).toEqual([
        "accepted",
        "accepted",
        "rejected",
      ]);
      const mine = JSON.parse(
        (await call(alice, "GET", "/me/mission-applications")).payload,
      ) as MyMissionApplicationsResponse;
      expect(mine.items[0]?.application.validation).toBeDefined();
      expect(mine.items[0]?.mission.viewerApplication?.status).toBe("accepted");

      // Profile card, public.
      const profile = JSON.parse(
        (await call(null, "GET", `/users/${alice.id}/experiences`)).payload,
      ) as UserExperiencesResponse;
      expect(profile.items).toHaveLength(1);
      expect(profile.items[0]?.mission.title).toBe(mission.title);
      expect(profile.items[0]?.deliverableUrl).toBe(deliverable);
      expect(profile.items[0]?.attester.id).toBe(mentor.id);

      // A validated participant cannot withdraw; a mission with a validation cannot be deleted.
      expect(
        (await call(alice, "DELETE", `/missions/${mission.id}/applications/mine`)).statusCode,
      ).toBe(409);
      const del = await call(mentor, "DELETE", `/missions/${mission.id}`);
      expect(del.statusCode).toBe(409);
      expect(JSON.parse(del.payload)).toEqual({ error: "mission_has_certifications" });
    });

    it("publishes a validation, skips a withdrawn one, and reactivates it", async () => {
      const mentor = await createUser("publisher", "mentor");
      const dev = await createUser("dev");
      const mission = await createMission(mentor);
      const application = await apply(dev, mission.id);
      await decide(mentor, mission.id, application.id, "accepted");
      const validate = () =>
        call(mentor, "POST", `/missions/${mission.id}/applications/${application.id}/validate`, {});

      const first = JSON.parse((await validate()).payload) as MissionApplicationResponse;
      const experienceId = first.item.validation!.id;

      // Withdrawn before publication: never published.
      expect(
        (
          await call(
            mentor,
            "DELETE",
            `/missions/${mission.id}/applications/${application.id}/validation`,
          )
        ).statusCode,
      ).toBe(204);
      const { chain, terms } = fakeChain();
      const skipped = await processExperienceEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyIds: [experienceId],
      });
      expect(skipped.skippedRevoked).toBe(1);
      expect(
        (JSON.parse((await call(null, "GET", `/users/${dev.id}/experiences`)).payload) as UserExperiencesResponse)
          .items,
      ).toHaveLength(0);

      // Validated again: same row, event reopened, then published.
      const again = JSON.parse((await validate()).payload) as MissionApplicationResponse;
      expect(again.item.validation!.id).toBe(experienceId);
      const published = await processExperienceEvents(db, chain, {
        profileOrigin: ORIGIN,
        onlyIds: [experienceId],
      });
      expect(published.published).toBe(1);

      const expected = experienceTerms({
        profileOrigin: ORIGIN,
        missionId: mission.id,
        recipientId: dev.id,
        attesterId: mentor.id,
      });
      expect(terms.has(expected.attestation.id)).toBe(true);
      const [row] = await db
        .select()
        .from(experienceCertifications)
        .where(eq(experienceCertifications.id, experienceId));
      expect(row?.claimTripleId).toBe(expected.claim.id);
      expect(row?.attestationTripleId).toBe(expected.attestation.id);
      expect(row?.publishedAt).not.toBeNull();
      const [event] = await db
        .select()
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.eventType, EXPERIENCE_ATTESTED_EVENT),
            eq(outboxEvents.aggregateId, experienceId),
          ),
        );
      expect(event?.processedAt).not.toBeNull();

      const profile = JSON.parse(
        (await call(null, "GET", `/users/${dev.id}/experiences`)).payload,
      ) as UserExperiencesResponse;
      expect(profile.items[0]?.proof?.attestationTripleId).toBe(expected.attestation.id);
    });

    it("a cancelled mission validates only delivered work", async () => {
      const mentor = await createUser("cancel", "mentor");
      const withLink = await createUser("delivered");
      const without = await createUser("undelivered");
      const mission = await createMission(mentor, { places: 2 });
      const a = await apply(withLink, mission.id);
      const b = await apply(without, mission.id);
      await decide(mentor, mission.id, a.id, "accepted");
      await decide(mentor, mission.id, b.id, "accepted");
      await call(withLink, "PATCH", `/missions/${mission.id}/applications/${a.id}`, {
        deliverableUrl: "https://example.org/demo",
      });

      const cancel = await call(mentor, "PATCH", `/missions/${mission.id}`, {
        status: "cancelled",
      });
      expect(cancel.statusCode).toBe(200);

      // Closed: no new applications, no edits.
      const late = await createUser("late");
      expect(
        (
          await call(late, "POST", `/missions/${mission.id}/applications`, { message: "Hi" })
        ).statusCode,
      ).toBe(409);
      expect(
        (await call(mentor, "PATCH", `/missions/${mission.id}`, { title: "Renamed mission" }))
          .statusCode,
      ).toBe(409);

      const refused = await call(
        mentor,
        "POST",
        `/missions/${mission.id}/applications/${b.id}/validate`,
        {},
      );
      expect(refused.statusCode).toBe(409);
      expect(JSON.parse(refused.payload)).toEqual({ error: "mission_cancelled" });
      const ok = await call(
        mentor,
        "POST",
        `/missions/${mission.id}/applications/${a.id}/validate`,
        {},
      );
      expect(ok.statusCode).toBe(201);
    });

    it("an applicant can withdraw and apply again; a mission without validations can be deleted", async () => {
      const mentor = await createUser("cleanup", "mentor");
      const dev = await createUser("changer");
      const mission = await createMission(mentor);
      await apply(dev, mission.id);
      expect(
        (await call(dev, "DELETE", `/missions/${mission.id}/applications/mine`)).statusCode,
      ).toBe(204);
      const back = await apply(dev, mission.id);
      expect(back.status).toBe("pending");

      expect((await call(dev, "DELETE", `/missions/${mission.id}`)).statusCode).toBe(403);
      expect((await call(mentor, "DELETE", `/missions/${mission.id}`)).statusCode).toBe(204);
      expect((await call(dev, "GET", `/missions/${mission.id}`)).statusCode).toBe(404);
    });
  },
);
