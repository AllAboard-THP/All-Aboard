import { randomUUID } from "node:crypto";
import pg from "pg";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type {
  CertificationEligibilityResponse,
  CreateCertificationResponse,
  SkillsResponse,
  UserCertificationsResponse,
} from "@allaboard/types";
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
import { CERTIFICATION_ATTESTED, CERTIFICATIONS_PER_DAY } from "./certifications";

const seedPassword =
  process.env.DEV_SEED_PASSWORD?.trim() ||
  process.env.MVP_LOGIN_PASSWORD?.trim() ||
  "";

describe.skipIf(!process.env.DATABASE_URL || !seedPassword)(
  "certifications (database)",
  () => {
    let pool: pg.Pool;
    let db: ReturnType<typeof drizzle>;
    let app: Awaited<ReturnType<typeof buildApp>>;
    let skillIds: string[];
    const run = randomUUID().slice(0, 8);

    async function createUser(name: string, role: "student" | "mentor" | "admin" = "student") {
      const email = `cert-${name}-${run}@test.local`;
      await seedUsers(db, [
        { email, role, password: seedPassword, fullName: `${name} ${run}` },
      ]);
      const [row] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return row!;
    }

    /** `helped` answered a help request written by `author`. */
    async function recordHelp(
      author: { id: string },
      helped: { id: string },
      options: { flagged?: boolean } = {},
    ) {
      const [request] = await db
        .insert(helpRequests)
        .values({ title: `Help ${randomUUID()}`, authorId: author.id })
        .returning({ id: helpRequests.id });
      await db.insert(responses).values({
        helpRequestId: request!.id,
        body: "Here is how",
        authorId: helped.id,
        flaggedForModeration: options.flagged ?? false,
      });
    }

    function tokenFor(user: { id: string }, role?: "admin") {
      return app.jwt.sign(role ? { sub: user.id, role } : { sub: user.id });
    }

    async function giveCertification(
      attester: { id: string },
      recipient: { id: string },
      payload: Record<string, unknown>,
    ) {
      return app.inject({
        method: "POST",
        url: `/users/${recipient.id}/certifications`,
        headers: { authorization: `Bearer ${tokenFor(attester)}` },
        payload,
      });
    }

    beforeAll(async () => {
      pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle(pool);
      await ensureMigrated(process.env.DATABASE_URL!);
      await seedSkills(db, defaultSeedSkills());
      const rows = await db
        .select({ id: skills.id })
        .from(skills)
        .where(eq(skills.active, true));
      skillIds = rows.map((row) => row.id);
      // Flag every comment the local rules catch, without calling the agent.
      app = await buildApp({ pool, evaluateModeration: async () => true });
    });

    afterAll(async () => {
      await app.close();
      await pool.end();
    });

    it("GET /skills lists the active catalogue", async () => {
      const res = await app.inject({ method: "GET", url: "/skills" });
      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload) as SkillsResponse;
      expect(body.items.map((s) => s.slug)).toContain("ruby-on-rails");
      expect(body.items.every((s) => s.active)).toBe(true);
    });

    it("accepts a +1 after help and enqueues certification.attested", async () => {
      const helper = await createUser("helper");
      const helped = await createUser("helped");
      await recordHelp(helped, helper);

      const eligibilityRes = await app.inject({
        method: "GET",
        url: `/users/${helper.id}/certifications/eligibility`,
        headers: { authorization: `Bearer ${tokenFor(helped)}` },
      });
      expect(eligibilityRes.statusCode).toBe(200);
      expect(
        (JSON.parse(eligibilityRes.payload) as CertificationEligibilityResponse)
          .eligible,
      ).toBe(true);

      const res = await giveCertification(helped, helper, {
        skillId: skillIds[0],
        comment: "  Clear and patient  ",
      });
      expect(res.statusCode).toBe(201);
      const created = JSON.parse(res.payload) as CreateCertificationResponse;
      expect(created.item.comment).toBe("Clear and patient");
      expect(created.item.attester.id).toBe(helped.id);

      const events = await db
        .select()
        .from(outboxEvents)
        .where(
          and(
            eq(outboxEvents.eventType, CERTIFICATION_ATTESTED),
            eq(outboxEvents.aggregateId, created.item.id),
          ),
        );
      expect(events).toHaveLength(1);
      expect(events[0]!.processedAt).toBeNull();

      const listRes = await app.inject({
        method: "GET",
        url: `/users/${helper.id}/certifications`,
      });
      const list = JSON.parse(listRes.payload) as UserCertificationsResponse;
      expect(list.items).toHaveLength(1);
      expect(list.items[0]!.count).toBe(1);
      expect(list.items[0]!.items[0]!.id).toBe(created.item.id);
    });

    it("rejects a +1 without prior help, or when the answer is flagged", async () => {
      const stranger = await createUser("stranger");
      const viewer = await createUser("viewer");
      const res = await giveCertification(viewer, stranger, { skillId: skillIds[0] });
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.payload)).toEqual({ error: "not_eligible" });

      await recordHelp(viewer, stranger, { flagged: true });
      const flaggedRes = await giveCertification(viewer, stranger, {
        skillId: skillIds[0],
      });
      expect(flaggedRes.statusCode).toBe(403);
    });

    it("rejects a +1 to oneself and an unknown skill", async () => {
      const user = await createUser("self");
      const selfRes = await giveCertification(user, user, { skillId: skillIds[0] });
      expect(selfRes.statusCode).toBe(400);
      expect(JSON.parse(selfRes.payload)).toEqual({ error: "self_certification" });

      const other = await createUser("other");
      await recordHelp(user, other);
      const skillRes = await giveCertification(user, other, { skillId: randomUUID() });
      expect(skillRes.statusCode).toBe(404);
      expect(JSON.parse(skillRes.payload)).toEqual({ error: "skill_not_found" });
    });

    it("returns 409 on a duplicate, then reactivates a withdrawn +1", async () => {
      const helper = await createUser("dup-helper");
      const helped = await createUser("dup-helped");
      await recordHelp(helped, helper);

      const first = await giveCertification(helped, helper, { skillId: skillIds[1] });
      expect(first.statusCode).toBe(201);
      const { item } = JSON.parse(first.payload) as CreateCertificationResponse;

      const duplicate = await giveCertification(helped, helper, { skillId: skillIds[1] });
      expect(duplicate.statusCode).toBe(409);
      expect(JSON.parse(duplicate.payload)).toEqual({ error: "already_attested" });

      const intruder = await createUser("intruder");
      const forbidden = await app.inject({
        method: "DELETE",
        url: `/users/${helper.id}/certifications/${item.id}`,
        headers: { authorization: `Bearer ${tokenFor(intruder)}` },
      });
      expect(forbidden.statusCode).toBe(403);

      const withdraw = await app.inject({
        method: "DELETE",
        url: `/users/${helper.id}/certifications/${item.id}`,
        headers: { authorization: `Bearer ${tokenFor(helped)}` },
      });
      expect(withdraw.statusCode).toBe(204);

      const afterWithdraw = await app.inject({
        method: "GET",
        url: `/users/${helper.id}/certifications`,
      });
      expect(
        (JSON.parse(afterWithdraw.payload) as UserCertificationsResponse).items,
      ).toHaveLength(0);

      const again = await giveCertification(helped, helper, {
        skillId: skillIds[1],
        comment: "Still true",
      });
      expect(again.statusCode).toBe(201);
      const reactivated = JSON.parse(again.payload) as CreateCertificationResponse;
      expect(reactivated.item.id).toBe(item.id);
      expect(reactivated.item.comment).toBe("Still true");
    });

    it("rejects a comment caught by moderation", async () => {
      const helper = await createUser("mod-helper");
      const helped = await createUser("mod-helped");
      await recordHelp(helped, helper);
      const res = await giveCertification(helped, helper, {
        skillId: skillIds[0],
        comment: "what the fuck",
      });
      expect(res.statusCode).toBe(422);
      expect(JSON.parse(res.payload)).toEqual({ error: "comment_rejected" });
    });

    it("limits +1s per attester over 24 hours", async () => {
      const attester = await createUser("busy");
      const helper = await createUser("busy-helper");
      await recordHelp(attester, helper);
      const others = [await createUser("busy-a"), await createUser("busy-b"), await createUser("busy-c")];
      const rows = others
        .flatMap((recipient) =>
          skillIds.map((skillId) => ({
            recipientId: recipient.id,
            attesterId: attester.id,
            skillId,
          })),
        )
        .slice(0, CERTIFICATIONS_PER_DAY);
      expect(rows).toHaveLength(CERTIFICATIONS_PER_DAY);
      await db.insert(certifications).values(rows);

      const res = await giveCertification(attester, helper, { skillId: skillIds[0] });
      expect(res.statusCode).toBe(429);
      expect(JSON.parse(res.payload)).toEqual({ error: "rate_limited" });
    });

    it("lets admins add and deactivate skills, and blocks others", async () => {
      const admin = await createUser("admin", "admin");
      const student = await createUser("student");
      const slug = `skill-${run}`;

      const denied = await app.inject({
        method: "POST",
        url: "/admin/skills",
        headers: { authorization: `Bearer ${tokenFor(student)}` },
        payload: { slug, label: "Elixir" },
      });
      expect(denied.statusCode).toBe(403);

      const created = await app.inject({
        method: "POST",
        url: "/admin/skills",
        headers: { authorization: `Bearer ${tokenFor(admin, "admin")}` },
        payload: { slug, label: "Elixir" },
      });
      expect(created.statusCode).toBe(201);
      const { item } = JSON.parse(created.payload) as { item: { id: string } };

      const taken = await app.inject({
        method: "POST",
        url: "/admin/skills",
        headers: { authorization: `Bearer ${tokenFor(admin, "admin")}` },
        payload: { slug, label: "Elixir again" },
      });
      expect(taken.statusCode).toBe(409);

      const deactivated = await app.inject({
        method: "PATCH",
        url: `/admin/skills/${item.id}`,
        headers: { authorization: `Bearer ${tokenFor(admin, "admin")}` },
        payload: { active: false },
      });
      expect(deactivated.statusCode).toBe(200);

      const list = await app.inject({ method: "GET", url: "/skills" });
      const ids = (JSON.parse(list.payload) as SkillsResponse).items.map((s) => s.id);
      expect(ids).not.toContain(item.id);
    });
  },
);
