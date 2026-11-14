import type { FastifyInstance } from "fastify";
import { and, asc, count, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import type {
  Certification,
  CertificationEligibilityResponse,
  CreateCertificationResponse,
  Skill,
  SkillCertificationGroup,
  SkillsResponse,
  UserCertificationsResponse,
} from "@allaboard/types";
import type { EvaluateModerationFn } from "../agent/moderation.js";
import { isUuid } from "../auth/passkey/config.js";
import type { AppDatabase } from "../db/client.js";
import {
  certifications,
  helpRequests,
  outboxEvents,
  responses,
  skills,
  users,
} from "../db/schema.js";
import {
  authorIdKeysFromRow,
  getJwtUser,
  resolveAuthenticatedUser,
  type AuthenticatedUser,
} from "../lib/auth-helpers.js";
import { createCertificationBodySchema } from "../lib/schemas.js";
import { displayNameFromUser } from "../lib/user-mappers.js";
import {
  contentShouldBeFlagged,
  moderationContentFromFields,
} from "../services/profanity.js";
import { loadUserById } from "../services/user-profile.js";

export const CERTIFICATION_ATTESTED = "certification.attested";

/** Max +1s one person can give in a rolling 24 hours (ADR 0009 §4). */
export const CERTIFICATIONS_PER_DAY = 20;

class AlreadyAttestedError extends Error {}

type SkillRow = typeof skills.$inferSelect;
type CertificationRow = typeof certifications.$inferSelect;
type AttesterRow = Pick<
  typeof users.$inferSelect,
  "id" | "fullName" | "email" | "avatarUrl"
>;

export function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    active: row.active,
  };
}

function rowToCertification(
  row: CertificationRow,
  attester: AttesterRow,
): Certification {
  return {
    id: row.id,
    skillId: row.skillId,
    attester: {
      id: attester.id,
      displayName: displayNameFromUser(attester),
      avatarUrl: attester.avatarUrl ?? undefined,
    },
    comment: row.comment ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * The attester wrote a help request that the recipient answered (ADR 0009 §4).
 * `author_id` is text and may hold the uuid, email or short name.
 */
export async function hasHelpedAttester(
  db: AppDatabase,
  attester: { id: string; email: string },
  recipient: { id: string; email: string },
): Promise<boolean> {
  const rows = await db
    .select({ id: responses.id })
    .from(responses)
    .innerJoin(helpRequests, eq(responses.helpRequestId, helpRequests.id))
    .where(
      and(
        inArray(helpRequests.authorId, authorIdKeysFromRow(attester)),
        inArray(responses.authorId, authorIdKeysFromRow(recipient)),
        isNull(helpRequests.deletedAt),
        eq(responses.flaggedForModeration, false),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

async function loadRecipient(db: AppDatabase, id: string) {
  if (!isUuid(id)) return null;
  return loadUserById(db, id);
}

async function resolveViewer(
  db: AppDatabase,
  request: { user: unknown },
): Promise<AuthenticatedUser | null> {
  const jwtUser = getJwtUser(request);
  return resolveAuthenticatedUser(db, jwtUser.sub, jwtUser.role);
}

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } }).code ??
    (error as { cause?: { code?: string } }).cause?.code;
  return code === "23505";
}

export function registerCertificationRoutes(
  app: FastifyInstance,
  db: AppDatabase | null,
  evaluateModeration: EvaluateModerationFn,
) {
  app.get("/skills", async (_request, reply): Promise<SkillsResponse | void> => {
    if (!db) {
      return reply.code(503).send({ error: "database_unavailable" });
    }
    const rows = await db
      .select()
      .from(skills)
      .where(eq(skills.active, true))
      .orderBy(asc(skills.label));
    return { items: rows.map(rowToSkill) };
  });

  app.get(
    "/users/:id/certifications",
    async (request, reply): Promise<UserCertificationsResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const recipient = await loadRecipient(db, id);
      if (!recipient) {
        return reply.code(404).send({ error: "user_not_found" });
      }

      const rows = await db
        .select({
          certification: certifications,
          skill: skills,
          attester: {
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(certifications)
        .innerJoin(skills, eq(certifications.skillId, skills.id))
        .innerJoin(users, eq(certifications.attesterId, users.id))
        .where(
          and(
            eq(certifications.recipientId, recipient.id),
            isNull(certifications.revokedAt),
          ),
        )
        .orderBy(desc(certifications.createdAt));

      const groups = new Map<string, SkillCertificationGroup>();
      for (const row of rows) {
        let group = groups.get(row.skill.id);
        if (!group) {
          group = { skill: rowToSkill(row.skill), count: 0, items: [] };
          groups.set(row.skill.id, group);
        }
        group.count += 1;
        group.items.push(rowToCertification(row.certification, row.attester));
      }

      const items = [...groups.values()].sort(
        (a, b) => b.count - a.count || a.skill.label.localeCompare(b.skill.label),
      );
      return { items };
    },
  );

  app.get(
    "/users/:id/certifications/eligibility",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CertificationEligibilityResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id } = request.params as { id: string };
      const recipient = await loadRecipient(db, id);
      if (!recipient) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      const viewer = await resolveViewer(db, request);
      if (!viewer) {
        return reply.code(401).send({ error: "unauthorized" });
      }
      if (viewer.id === recipient.id) {
        return { eligible: false, attestedSkillIds: [] };
      }

      const attested = await db
        .select({ skillId: certifications.skillId })
        .from(certifications)
        .where(
          and(
            eq(certifications.recipientId, recipient.id),
            eq(certifications.attesterId, viewer.id),
            isNull(certifications.revokedAt),
          ),
        );
      return {
        eligible: await hasHelpedAttester(db, viewer, recipient),
        attestedSkillIds: attested.map((row) => row.skillId),
      };
    },
  );

  app.post(
    "/users/:id/certifications",
    { preHandler: [app.authenticate] },
    async (request, reply): Promise<CreateCertificationResponse | void> => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const parsed = createCertificationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: "invalid_body" });
      }
      const { id } = request.params as { id: string };
      const recipient = await loadRecipient(db, id);
      if (!recipient) {
        return reply.code(404).send({ error: "user_not_found" });
      }
      const viewer = await resolveViewer(db, request);
      if (!viewer) {
        return reply.code(401).send({ error: "unauthorized" });
      }
      if (viewer.id === recipient.id) {
        return reply.code(400).send({ error: "self_certification" });
      }

      const skillRows = await db
        .select()
        .from(skills)
        .where(and(eq(skills.id, parsed.data.skillId), eq(skills.active, true)))
        .limit(1);
      if (skillRows.length === 0) {
        return reply.code(404).send({ error: "skill_not_found" });
      }

      if (!(await hasHelpedAttester(db, viewer, recipient))) {
        return reply.code(403).send({ error: "not_eligible" });
      }

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [recent] = await db
        .select({ value: count() })
        .from(certifications)
        .where(
          and(
            eq(certifications.attesterId, viewer.id),
            gt(certifications.createdAt, since),
          ),
        );
      if ((recent?.value ?? 0) >= CERTIFICATIONS_PER_DAY) {
        return reply.code(429).send({ error: "rate_limited" });
      }

      const comment = parsed.data.comment?.trim() || null;
      if (
        comment &&
        (await contentShouldBeFlagged(
          db,
          moderationContentFromFields([comment]),
          evaluateModeration,
        ))
      ) {
        return reply.code(422).send({ error: "comment_rejected" });
      }

      let saved: CertificationRow;
      try {
        saved = await db.transaction(async (tx) => {
          const existing = await tx
            .select()
            .from(certifications)
            .where(
              and(
                eq(certifications.recipientId, recipient.id),
                eq(certifications.attesterId, viewer.id),
                eq(certifications.skillId, parsed.data.skillId),
              ),
            )
            .limit(1);

          let row: CertificationRow;
          const previous = existing[0];
          if (previous && !previous.revokedAt) {
            throw new AlreadyAttestedError();
          }
          if (previous) {
            const [updated] = await tx
              .update(certifications)
              .set({ revokedAt: null, comment })
              .where(eq(certifications.id, previous.id))
              .returning();
            row = updated!;
          } else {
            const [inserted] = await tx
              .insert(certifications)
              .values({
                recipientId: recipient.id,
                attesterId: viewer.id,
                skillId: parsed.data.skillId,
                comment,
              })
              .returning();
            row = inserted!;
          }

          await tx
            .insert(outboxEvents)
            .values({
              eventType: CERTIFICATION_ATTESTED,
              aggregateId: row.id,
              payload: {
                id: row.id,
                recipientId: row.recipientId,
                attesterId: row.attesterId,
                skillId: row.skillId,
              },
            })
            .onConflictDoNothing();
          return row;
        });
      } catch (error) {
        if (error instanceof AlreadyAttestedError || isUniqueViolation(error)) {
          return reply.code(409).send({ error: "already_attested" });
        }
        throw error;
      }

      const attester = await loadUserById(db, viewer.id);
      void reply.code(201);
      return { item: rowToCertification(saved, attester!) };
    },
  );

  app.delete(
    "/users/:id/certifications/:certificationId",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      if (!db) {
        return reply.code(503).send({ error: "database_unavailable" });
      }
      const { id, certificationId } = request.params as {
        id: string;
        certificationId: string;
      };
      if (!isUuid(id) || !isUuid(certificationId)) {
        return reply.code(404).send({ error: "not_found" });
      }
      const viewer = await resolveViewer(db, request);
      if (!viewer) {
        return reply.code(401).send({ error: "unauthorized" });
      }

      const rows = await db
        .select()
        .from(certifications)
        .where(
          and(
            eq(certifications.id, certificationId),
            eq(certifications.recipientId, id),
            isNull(certifications.revokedAt),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) {
        return reply.code(404).send({ error: "not_found" });
      }
      if (row.attesterId !== viewer.id) {
        return reply.code(403).send({ error: "forbidden" });
      }

      // Postgres only (ADR 0009 §5): the on-chain +1, once published, stays as history.
      await db
        .update(certifications)
        .set({ revokedAt: new Date() })
        .where(eq(certifications.id, row.id));
      void reply.code(204);
      return;
    },
  );
}
