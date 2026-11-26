/**
 * Missions (#193, ADR 0010): mentors post, anyone applies, the author accepts
 * and validates each participant. A validation is an experience certification,
 * published on Intuition through the `experience.attested` outbox event.
 */
import type { FastifyInstance, FastifyReply } from "fastify";
import { and, count, eq, gt, inArray, isNull, ne, type SQL } from "drizzle-orm";
import type {
  MissionApplicationResponse,
  MissionResponse,
  MissionsResponse,
  MissionStatus,
  MyMissionApplicationsResponse,
  MyMissionsResponse,
  UserExperiencesResponse,
} from "@allaboard/types";
import type { EvaluateModerationFn } from "../agent/moderation.js";
import { isUuid } from "../auth/passkey/config.js";
import type { AppDatabase } from "../db/client.js";
import {
  experienceCertifications,
  missionApplications,
  missions,
  missionSkills,
  outboxEvents,
  skills,
} from "../db/schema.js";
import {
  getJwtUser,
  resolveAuthenticatedUser,
  type AuthenticatedUser,
} from "../lib/auth-helpers.js";
import {
  loadApplications,
  loadMission,
  loadMissions,
  loadUserExperiences,
  type ExperienceCertificationRow,
  type MissionApplicationRow,
  type MissionRow,
} from "../lib/missions-query.js";
import {
  createMissionApplicationBodySchema,
  createMissionBodySchema,
  missionApplicationDecisionBodySchema,
  updateMissionApplicationBodySchema,
  updateMissionBodySchema,
  validateMissionApplicationBodySchema,
} from "../lib/schemas.js";
import {
  contentShouldBeFlagged,
  moderationContentFromFields,
} from "../services/profanity.js";
import { loadUserById } from "../services/user-profile.js";

export const EXPERIENCE_ATTESTED = "experience.attested";

/** Missions one author can create in a rolling 24 hours. */
export const MISSIONS_PER_DAY = 10;

/** Validations one author can give in a rolling 24 hours (ADR 0010, risks). */
export const VALIDATIONS_PER_DAY = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

const CLOSED_STATUSES: MissionStatus[] = ["completed", "cancelled"];

class ConflictError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

function isUniqueViolation(error: unknown): boolean {
  const code =
    (error as { code?: string }).code ??
    (error as { cause?: { code?: string } }).cause?.code;
  return code === "23505";
}

async function resolveViewer(
  db: AppDatabase,
  request: { user: unknown },
): Promise<AuthenticatedUser | null> {
  const jwtUser = getJwtUser(request);
  return resolveAuthenticatedUser(db, jwtUser.sub, jwtUser.role);
}

async function findMission(db: AppDatabase, id: string): Promise<MissionRow | null> {
  if (!isUuid(id)) return null;
  const [row] = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return row ?? null;
}

async function findApplication(
  db: AppDatabase,
  missionId: string,
  applicationId: string,
): Promise<MissionApplicationRow | null> {
  if (!isUuid(applicationId)) return null;
  const [row] = await db
    .select()
    .from(missionApplications)
    .where(
      and(
        eq(missionApplications.id, applicationId),
        eq(missionApplications.missionId, missionId),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function activeValidation(
  db: AppDatabase,
  applicationId: string,
): Promise<ExperienceCertificationRow | null> {
  const [row] = await db
    .select()
    .from(experienceCertifications)
    .where(
      and(
        eq(experienceCertifications.applicationId, applicationId),
        isNull(experienceCertifications.revokedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function acceptedCount(db: AppDatabase, missionId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(missionApplications)
    .where(
      and(
        eq(missionApplications.missionId, missionId),
        eq(missionApplications.status, "accepted"),
      ),
    );
  return row?.value ?? 0;
}

/** Unknown or inactive skill ids are refused rather than silently dropped. */
async function checkSkillIds(db: AppDatabase, ids: string[]): Promise<boolean> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return true;
  const rows = await db
    .select({ id: skills.id })
    .from(skills)
    .where(and(inArray(skills.id, unique), eq(skills.active, true)));
  return rows.length === unique.length;
}

function toDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  return value === null ? null : new Date(value);
}

function emptyToNull(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function registerMissionRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
  evaluateModeration: EvaluateModerationFn,
) {
  async function flagged(fields: Array<string | null | undefined>): Promise<boolean> {
    const content = moderationContentFromFields(fields);
    return content.length > 0 && contentShouldBeFlagged(db!, content, evaluateModeration);
  }

  /** Common prelude: database, signed-in viewer. */
  async function viewerOrReply(
    request: { user: unknown },
    reply: FastifyReply,
  ): Promise<AuthenticatedUser | null> {
    if (!db) {
      void reply.code(503).send({ error: "database_unavailable" });
      return null;
    }
    const viewer = await resolveViewer(db, request);
    if (!viewer) {
      void reply.code(401).send({ error: "unauthorized" });
      return null;
    }
    return viewer;
  }

  app.get(
    "/missions",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionsResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const query = request.query as Record<string, unknown>;

      const conditions: SQL[] = [];
      if (
        query.kind === "personal_project" ||
        query.kind === "freelance" ||
        query.kind === "hackathon"
      ) {
        conditions.push(eq(missions.kind, query.kind));
      }
      // Default: what can still be joined or is running.
      if (query.status === "all") {
        conditions.push(ne(missions.status, "cancelled"));
      } else if (
        query.status === "open" ||
        query.status === "in_progress" ||
        query.status === "completed"
      ) {
        conditions.push(eq(missions.status, query.status));
      } else {
        conditions.push(inArray(missions.status, ["open", "in_progress"]));
      }
      if (typeof query.skill === "string" && query.skill.trim()) {
        const skill = query.skill.trim();
        const [skillRow] = await db!
          .select({ id: skills.id })
          .from(skills)
          .where(isUuid(skill) ? eq(skills.id, skill) : eq(skills.slug, skill.toLowerCase()))
          .limit(1);
        if (!skillRow) return { items: [] };
        const withSkill = db!
          .select({ id: missionSkills.missionId })
          .from(missionSkills)
          .where(eq(missionSkills.skillId, skillRow.id));
        conditions.push(inArray(missions.id, withSkill));
      }

      const items = await loadMissions(db!, {
        where: and(...conditions),
        viewerId: viewer.id,
      });
      return { items };
    },
  );

  app.get(
    "/missions/:id",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id } = request.params as { id: string };
      const item = isUuid(id) ? await loadMission(db!, id, viewer.id) : null;
      if (!item) {
        return reply.code(404).send({ error: "mission_not_found" });
      }
      return { item };
    },
  );

  app.post(
    "/missions",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      if (viewer.role !== "mentor") {
        return reply.code(403).send({ error: "mentor_only" });
      }
      const parsed = createMissionBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const body = parsed.data;
      const skillIds = [...new Set(body.skillIds ?? [])];
      if (!(await checkSkillIds(db!, skillIds))) {
        return reply.code(404).send({ error: "skill_not_found" });
      }

      const [recent] = await db!
        .select({ value: count() })
        .from(missions)
        .where(
          and(
            eq(missions.authorId, viewer.id),
            gt(missions.createdAt, new Date(Date.now() - DAY_MS)),
          ),
        );
      if ((recent?.value ?? 0) >= MISSIONS_PER_DAY) {
        return reply.code(429).send({ error: "rate_limited" });
      }

      if (await flagged([body.title, body.description, body.compensation])) {
        return reply.code(422).send({ error: "content_rejected" });
      }

      const missionId = await db!.transaction(async (tx) => {
        const [row] = await tx
          .insert(missions)
          .values({
            authorId: viewer.id,
            kind: body.kind,
            title: body.title,
            description: body.description,
            githubRepoUrl: emptyToNull(body.githubRepoUrl) ?? null,
            compensation: emptyToNull(body.compensation) ?? null,
            places: body.places ?? 1,
            startsAt: toDate(body.startsAt) ?? null,
            endsAt: toDate(body.endsAt) ?? null,
          })
          .returning({ id: missions.id });
        if (skillIds.length > 0) {
          await tx
            .insert(missionSkills)
            .values(skillIds.map((skillId) => ({ missionId: row!.id, skillId })));
        }
        return row!.id;
      });

      void reply.code(201);
      return { item: (await loadMission(db!, missionId, viewer.id))! };
    },
  );

  app.patch(
    "/missions/:id",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id } = request.params as { id: string };
      const mission = await findMission(db!, id);
      if (!mission) {
        return reply.code(404).send({ error: "mission_not_found" });
      }
      if (mission.authorId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      const parsed = updateMissionBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const body = parsed.data;

      if (CLOSED_STATUSES.includes(mission.status)) {
        return reply.code(409).send({ error: "mission_closed" });
      }
      const startsAt = body.startsAt === undefined ? mission.startsAt : toDate(body.startsAt);
      const endsAt = body.endsAt === undefined ? mission.endsAt : toDate(body.endsAt);
      if (startsAt && endsAt && endsAt < startsAt) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (body.places !== undefined && body.places < (await acceptedCount(db!, mission.id))) {
        return reply.code(409).send({ error: "places_below_accepted" });
      }
      const skillIds = body.skillIds ? [...new Set(body.skillIds)] : undefined;
      if (skillIds && !(await checkSkillIds(db!, skillIds))) {
        return reply.code(404).send({ error: "skill_not_found" });
      }
      if (await flagged([body.title, body.description, body.compensation])) {
        return reply.code(422).send({ error: "content_rejected" });
      }

      await db!.transaction(async (tx) => {
        await tx
          .update(missions)
          .set({
            ...(body.kind ? { kind: body.kind } : {}),
            ...(body.title ? { title: body.title } : {}),
            ...(body.description ? { description: body.description } : {}),
            ...(body.githubRepoUrl !== undefined
              ? { githubRepoUrl: emptyToNull(body.githubRepoUrl) ?? null }
              : {}),
            ...(body.compensation !== undefined
              ? { compensation: emptyToNull(body.compensation) ?? null }
              : {}),
            ...(body.places !== undefined ? { places: body.places } : {}),
            ...(body.startsAt !== undefined ? { startsAt: startsAt ?? null } : {}),
            ...(body.endsAt !== undefined ? { endsAt: endsAt ?? null } : {}),
            ...(body.status ? { status: body.status } : {}),
            updatedAt: new Date(),
          })
          .where(eq(missions.id, mission.id));
        if (skillIds) {
          await tx.delete(missionSkills).where(eq(missionSkills.missionId, mission.id));
          if (skillIds.length > 0) {
            await tx
              .insert(missionSkills)
              .values(skillIds.map((skillId) => ({ missionId: mission.id, skillId })));
          }
        }
      });

      return { item: (await loadMission(db!, mission.id, viewer.id))! };
    },
  );

  app.delete(
    "/missions/:id",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id } = request.params as { id: string };
      const mission = await findMission(db!, id);
      if (!mission) {
        return reply.code(404).send({ error: "mission_not_found" });
      }
      if (mission.authorId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      // ADR 0010 §6: once validated, a mission can only be cancelled.
      const [validated] = await db!
        .select({ id: experienceCertifications.id })
        .from(experienceCertifications)
        .where(eq(experienceCertifications.missionId, mission.id))
        .limit(1);
      if (validated) {
        return reply.code(409).send({ error: "mission_has_certifications" });
      }
      await db!.delete(missions).where(eq(missions.id, mission.id));
      void reply.code(204);
      return;
    },
  );

  app.post(
    "/missions/:id/applications",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionApplicationResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id } = request.params as { id: string };
      const mission = await findMission(db!, id);
      if (!mission) {
        return reply.code(404).send({ error: "mission_not_found" });
      }
      if (mission.authorId === viewer.id) {
        return reply.code(400).send({ error: "own_mission" });
      }
      if (mission.status !== "open") {
        return reply.code(409).send({ error: "mission_not_open" });
      }
      const parsed = createMissionApplicationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (await flagged([parsed.data.message])) {
        return reply.code(422).send({ error: "content_rejected" });
      }

      let applicationId: string;
      try {
        applicationId = await db!.transaction(async (tx) => {
          const [existing] = await tx
            .select()
            .from(missionApplications)
            .where(
              and(
                eq(missionApplications.missionId, mission.id),
                eq(missionApplications.applicantId, viewer.id),
              ),
            )
            .limit(1);
          if (existing && existing.status !== "withdrawn") {
            throw new ConflictError("already_applied");
          }
          if (existing) {
            await tx
              .update(missionApplications)
              .set({
                status: "pending",
                message: parsed.data.message,
                decidedAt: null,
                updatedAt: new Date(),
              })
              .where(eq(missionApplications.id, existing.id));
            return existing.id;
          }
          const [row] = await tx
            .insert(missionApplications)
            .values({
              missionId: mission.id,
              applicantId: viewer.id,
              message: parsed.data.message,
            })
            .returning({ id: missionApplications.id });
          return row!.id;
        });
      } catch (error) {
        if (error instanceof ConflictError || isUniqueViolation(error)) {
          return reply.code(409).send({ error: "already_applied" });
        }
        throw error;
      }

      const [item] = await loadApplications(db!, eq(missionApplications.id, applicationId));
      void reply.code(201);
      return { item: item! };
    },
  );

  /** The applicant withdraws their own application. */
  app.delete(
    "/missions/:id/applications/mine",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id } = request.params as { id: string };
      if (!isUuid(id)) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      const [application] = await db!
        .select()
        .from(missionApplications)
        .where(
          and(
            eq(missionApplications.missionId, id),
            eq(missionApplications.applicantId, viewer.id),
            ne(missionApplications.status, "withdrawn"),
          ),
        )
        .limit(1);
      if (!application) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      if (await activeValidation(db!, application.id)) {
        return reply.code(409).send({ error: "already_validated" });
      }
      await db!
        .update(missionApplications)
        .set({ status: "withdrawn", updatedAt: new Date() })
        .where(eq(missionApplications.id, application.id));
      void reply.code(204);
      return;
    },
  );

  /** The author accepts or rejects an application. */
  app.post(
    "/missions/:id/applications/:applicationId/decision",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionApplicationResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id, applicationId } = request.params as {
        id: string;
        applicationId: string;
      };
      const mission = await findMission(db!, id);
      const application = mission
        ? await findApplication(db!, mission.id, applicationId)
        : null;
      if (!mission || !application) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      if (mission.authorId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      const parsed = missionApplicationDecisionBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const { decision } = parsed.data;
      if (application.status === "withdrawn") {
        return reply.code(409).send({ error: "application_withdrawn" });
      }

      try {
        await db!.transaction(async (tx) => {
          if (decision === "accepted") {
            if (CLOSED_STATUSES.includes(mission.status)) {
              throw new ConflictError("mission_closed");
            }
            if (application.status !== "accepted") {
              // Lock the mission row so two accepts cannot both take the last place.
              await tx
                .select({ id: missions.id })
                .from(missions)
                .where(eq(missions.id, mission.id))
                .for("update");
              const [accepted] = await tx
                .select({ value: count() })
                .from(missionApplications)
                .where(
                  and(
                    eq(missionApplications.missionId, mission.id),
                    eq(missionApplications.status, "accepted"),
                  ),
                );
              if ((accepted?.value ?? 0) >= mission.places) {
                throw new ConflictError("mission_full");
              }
            }
          } else {
            const [validation] = await tx
              .select({ id: experienceCertifications.id })
              .from(experienceCertifications)
              .where(
                and(
                  eq(experienceCertifications.applicationId, application.id),
                  isNull(experienceCertifications.revokedAt),
                ),
              )
              .limit(1);
            if (validation) throw new ConflictError("already_validated");
          }
          await tx
            .update(missionApplications)
            .set({ status: decision, decidedAt: new Date(), updatedAt: new Date() })
            .where(eq(missionApplications.id, application.id));
        });
      } catch (error) {
        if (error instanceof ConflictError) {
          return reply.code(409).send({ error: error.code });
        }
        throw error;
      }

      const [item] = await loadApplications(db!, eq(missionApplications.id, application.id));
      return { item: item! };
    },
  );

  /** The accepted applicant sets or clears their deliverable link. */
  app.patch(
    "/missions/:id/applications/:applicationId",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionApplicationResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id, applicationId } = request.params as {
        id: string;
        applicationId: string;
      };
      const application = isUuid(id) ? await findApplication(db!, id, applicationId) : null;
      if (!application) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      if (application.applicantId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      if (application.status !== "accepted") {
        return reply.code(409).send({ error: "application_not_accepted" });
      }
      const parsed = updateMissionApplicationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      await db!
        .update(missionApplications)
        .set({ deliverableUrl: parsed.data.deliverableUrl, updatedAt: new Date() })
        .where(eq(missionApplications.id, application.id));

      const [item] = await loadApplications(db!, eq(missionApplications.id, application.id));
      return { item: item! };
    },
  );

  /** The author validates one participant: an experience certification (ADR 0010 §3). */
  app.post(
    "/missions/:id/applications/:applicationId/validate",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MissionApplicationResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id, applicationId } = request.params as {
        id: string;
        applicationId: string;
      };
      const mission = await findMission(db!, id);
      const application = mission
        ? await findApplication(db!, mission.id, applicationId)
        : null;
      if (!mission || !application) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      if (mission.authorId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      const parsed = validateMissionApplicationBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      if (application.status !== "accepted") {
        return reply.code(409).send({ error: "application_not_accepted" });
      }
      // Decided 2026-11-24: a cancelled mission still validates delivered work.
      if (mission.status === "cancelled" && !application.deliverableUrl) {
        return reply.code(409).send({ error: "mission_cancelled" });
      }

      const [recent] = await db!
        .select({ value: count() })
        .from(experienceCertifications)
        .where(
          and(
            eq(experienceCertifications.attesterId, viewer.id),
            gt(experienceCertifications.createdAt, new Date(Date.now() - DAY_MS)),
          ),
        );
      if ((recent?.value ?? 0) >= VALIDATIONS_PER_DAY) {
        return reply.code(429).send({ error: "rate_limited" });
      }

      const comment = parsed.data.comment?.trim() || null;
      if (comment && (await flagged([comment]))) {
        return reply.code(422).send({ error: "comment_rejected" });
      }

      try {
        await db!.transaction(async (tx) => {
          const [previous] = await tx
            .select()
            .from(experienceCertifications)
            .where(eq(experienceCertifications.applicationId, application.id))
            .limit(1);
          if (previous && !previous.revokedAt) {
            throw new ConflictError("already_validated");
          }

          let certificationId: string;
          if (previous) {
            await tx
              .update(experienceCertifications)
              .set({
                revokedAt: null,
                comment,
                createdAt: new Date(),
                // Not on-chain yet: start the retry schedule again.
                ...(previous.publishedAt
                  ? {}
                  : { publishAttempts: 0, publishError: null, nextPublishAt: null }),
              })
              .where(eq(experienceCertifications.id, previous.id));
            certificationId = previous.id;
          } else {
            const [inserted] = await tx
              .insert(experienceCertifications)
              .values({
                missionId: mission.id,
                applicationId: application.id,
                recipientId: application.applicantId,
                attesterId: viewer.id,
                comment,
              })
              .returning({ id: experienceCertifications.id });
            certificationId = inserted!.id;
          }

          await tx
            .insert(outboxEvents)
            .values({
              eventType: EXPERIENCE_ATTESTED,
              aggregateId: certificationId,
              payload: {
                id: certificationId,
                missionId: mission.id,
                recipientId: application.applicantId,
                attesterId: viewer.id,
              },
            })
            .onConflictDoNothing();
          if (previous && !previous.publishedAt) {
            // Reopen the event the publisher may have closed on withdrawal (ADR 0010 §5).
            await tx
              .update(outboxEvents)
              .set({ processedAt: null })
              .where(
                and(
                  eq(outboxEvents.eventType, EXPERIENCE_ATTESTED),
                  eq(outboxEvents.aggregateId, certificationId),
                ),
              );
          }

          if (mission.status === "open") {
            await tx
              .update(missions)
              .set({ status: "in_progress", updatedAt: new Date() })
              .where(eq(missions.id, mission.id));
          }
        });
      } catch (error) {
        if (error instanceof ConflictError || isUniqueViolation(error)) {
          return reply.code(409).send({ error: "already_validated" });
        }
        throw error;
      }

      const [item] = await loadApplications(db!, eq(missionApplications.id, application.id));
      void reply.code(201);
      return { item: item! };
    },
  );

  /** The author withdraws a validation. Postgres only (ADR 0010 §5). */
  app.delete(
    "/missions/:id/applications/:applicationId/validation",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const { id, applicationId } = request.params as {
        id: string;
        applicationId: string;
      };
      const mission = await findMission(db!, id);
      const application = mission
        ? await findApplication(db!, mission.id, applicationId)
        : null;
      if (!mission || !application) {
        return reply.code(404).send({ error: "application_not_found" });
      }
      if (mission.authorId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }
      const validation = await activeValidation(db!, application.id);
      if (!validation) {
        return reply.code(404).send({ error: "validation_not_found" });
      }
      await db!
        .update(experienceCertifications)
        .set({ revokedAt: new Date() })
        .where(eq(experienceCertifications.id, validation.id));
      void reply.code(204);
      return;
    },
  );

  /** Dashboard board of a mission author: every mission with its applications. */
  app.get(
    "/me/missions",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MyMissionsResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const items = await loadMissions(db!, {
        where: eq(missions.authorId, viewer.id),
        viewerId: viewer.id,
        limit: 200,
      });
      const applications =
        items.length > 0
          ? await loadApplications(
              db!,
              and(
                inArray(
                  missionApplications.missionId,
                  items.map((m) => m.id),
                ),
                ne(missionApplications.status, "withdrawn"),
              )!,
            )
          : [];
      return {
        items: items.map((mission) => ({
          mission,
          applications: applications.filter((a) => a.missionId === mission.id),
        })),
      };
    },
  );

  /** Dashboard, applicant side: every application of the viewer. */
  app.get(
    "/me/mission-applications",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<MyMissionApplicationsResponse | void> => {
      const viewer = await viewerOrReply(request, reply);
      if (!viewer) return;
      const applications = await loadApplications(
        db!,
        eq(missionApplications.applicantId, viewer.id),
      );
      if (applications.length === 0) return { items: [] };
      const missionsById = new Map(
        (
          await loadMissions(db!, {
            where: inArray(
              missions.id,
              applications.map((a) => a.missionId),
            ),
            viewerId: viewer.id,
            limit: 500,
          })
        ).map((m) => [m.id, m]),
      );
      return {
        items: applications
          .filter((application) => missionsById.has(application.missionId))
          .reverse()
          .map((application) => ({
            mission: missionsById.get(application.missionId)!,
            application,
          })),
      };
    },
  );

  /** Profile "Experience" card. Public, like the skill +1s. */
  app.get(
    "/users/:id/experiences",
    async (request, reply): Promise<UserExperiencesResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const user = isUuid(id) ? await loadUserById(db, id) : null;
      if (!user) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      return { items: await loadUserExperiences(db, user.id) };
    },
  );
}
