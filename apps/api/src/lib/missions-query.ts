/**
 * Read side of missions (#193, ADR 0010): rows to API shapes, with skills,
 * counts and the viewer's own application loaded in a few batched queries.
 */
import { and, asc, count, desc, eq, inArray, isNull, ne, type SQL } from "drizzle-orm";
import type {
  ExperienceCertification,
  ExperienceProof,
  Mission,
  MissionApplication,
  MissionPerson,
  MissionValidation,
  Skill,
} from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import {
  experienceCertifications,
  missionApplications,
  missions,
  missionSkills,
  skills,
  users,
} from "../db/schema.js";
import { displayNameFromUser } from "./user-mappers.js";

export type MissionRow = typeof missions.$inferSelect;
export type MissionApplicationRow = typeof missionApplications.$inferSelect;
export type ExperienceCertificationRow = typeof experienceCertifications.$inferSelect;

type PersonRow = Pick<typeof users.$inferSelect, "id" | "fullName" | "email" | "avatarUrl">;

const personColumns = {
  id: users.id,
  fullName: users.fullName,
  email: users.email,
  avatarUrl: users.avatarUrl,
};

export function rowToPerson(row: PersonRow): MissionPerson {
  return {
    id: row.id,
    displayName: displayNameFromUser(row),
    ...(row.avatarUrl ? { avatarUrl: row.avatarUrl } : {}),
  };
}

function proofOf(row: ExperienceCertificationRow): ExperienceProof | undefined {
  if (!row.publishedAt || !row.attestationTripleId || !row.claimTripleId) {
    return undefined;
  }
  return {
    network: "intuition-testnet",
    attestationTripleId: row.attestationTripleId,
    claimTripleId: row.claimTripleId,
    ...(row.txHash ? { txHash: row.txHash } : {}),
    publishedAt: row.publishedAt.toISOString(),
  };
}

export function rowToValidation(row: ExperienceCertificationRow): MissionValidation {
  const proof = proofOf(row);
  return {
    id: row.id,
    ...(row.comment ? { comment: row.comment } : {}),
    createdAt: row.createdAt.toISOString(),
    ...(proof ? { proof } : {}),
  };
}

/** Missions with author, skills, counts and the viewer's application. */
export async function loadMissions(
  db: AppDatabase,
  options: {
    where?: SQL;
    viewerId?: string;
    limit?: number;
  } = {},
): Promise<Mission[]> {
  const rows = await db
    .select({ mission: missions, author: personColumns })
    .from(missions)
    .innerJoin(users, eq(missions.authorId, users.id))
    .where(options.where)
    .orderBy(desc(missions.createdAt))
    .limit(options.limit ?? 100);
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.mission.id);

  const skillRows = await db
    .select({ missionId: missionSkills.missionId, skill: skills })
    .from(missionSkills)
    .innerJoin(skills, eq(missionSkills.skillId, skills.id))
    .where(inArray(missionSkills.missionId, ids))
    .orderBy(asc(skills.label));
  const skillsByMission = new Map<string, Skill[]>();
  for (const row of skillRows) {
    const list = skillsByMission.get(row.missionId) ?? [];
    list.push({
      id: row.skill.id,
      slug: row.skill.slug,
      label: row.skill.label,
      active: row.skill.active,
    });
    skillsByMission.set(row.missionId, list);
  }

  const countRows = await db
    .select({
      missionId: missionApplications.missionId,
      status: missionApplications.status,
      value: count(),
    })
    .from(missionApplications)
    .where(
      and(
        inArray(missionApplications.missionId, ids),
        ne(missionApplications.status, "withdrawn"),
      ),
    )
    .groupBy(missionApplications.missionId, missionApplications.status);
  const counts = new Map<string, { total: number; accepted: number }>();
  for (const row of countRows) {
    const entry = counts.get(row.missionId) ?? { total: 0, accepted: 0 };
    entry.total += row.value;
    if (row.status === "accepted") entry.accepted += row.value;
    counts.set(row.missionId, entry);
  }

  const viewerApps = new Map<string, MissionApplicationRow>();
  if (options.viewerId) {
    const appRows = await db
      .select()
      .from(missionApplications)
      .where(
        and(
          inArray(missionApplications.missionId, ids),
          eq(missionApplications.applicantId, options.viewerId),
        ),
      );
    for (const row of appRows) viewerApps.set(row.missionId, row);
  }

  return rows.map(({ mission, author }) => {
    const c = counts.get(mission.id) ?? { total: 0, accepted: 0 };
    const viewerApp = viewerApps.get(mission.id);
    return {
      id: mission.id,
      kind: mission.kind,
      title: mission.title,
      description: mission.description,
      ...(mission.githubRepoUrl ? { githubRepoUrl: mission.githubRepoUrl } : {}),
      ...(mission.compensation ? { compensation: mission.compensation } : {}),
      places: mission.places,
      acceptedCount: c.accepted,
      applicationCount: c.total,
      ...(mission.startsAt ? { startsAt: mission.startsAt.toISOString() } : {}),
      ...(mission.endsAt ? { endsAt: mission.endsAt.toISOString() } : {}),
      status: mission.status,
      skills: skillsByMission.get(mission.id) ?? [],
      author: rowToPerson(author),
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
      ...(viewerApp
        ? { viewerApplication: { id: viewerApp.id, status: viewerApp.status } }
        : {}),
    };
  });
}

export async function loadMission(
  db: AppDatabase,
  id: string,
  viewerId?: string,
): Promise<Mission | null> {
  const [item] = await loadMissions(db, {
    where: eq(missions.id, id),
    viewerId,
    limit: 1,
  });
  return item ?? null;
}

/** Applications with applicant and active validation. */
export async function loadApplications(
  db: AppDatabase,
  where: SQL,
): Promise<MissionApplication[]> {
  const rows = await db
    .select({
      application: missionApplications,
      applicant: personColumns,
      validation: experienceCertifications,
    })
    .from(missionApplications)
    .innerJoin(users, eq(missionApplications.applicantId, users.id))
    .leftJoin(
      experienceCertifications,
      and(
        eq(experienceCertifications.applicationId, missionApplications.id),
        isNull(experienceCertifications.revokedAt),
      ),
    )
    .where(where)
    .orderBy(asc(missionApplications.createdAt));

  return rows.map(({ application, applicant, validation }) => ({
    id: application.id,
    missionId: application.missionId,
    applicant: rowToPerson(applicant),
    message: application.message,
    status: application.status,
    ...(application.deliverableUrl
      ? { deliverableUrl: application.deliverableUrl }
      : {}),
    ...(application.decidedAt
      ? { decidedAt: application.decidedAt.toISOString() }
      : {}),
    createdAt: application.createdAt.toISOString(),
    ...(validation ? { validation: rowToValidation(validation) } : {}),
  }));
}

/** Active experience certifications of one person, newest first. */
export async function loadUserExperiences(
  db: AppDatabase,
  recipientId: string,
): Promise<ExperienceCertification[]> {
  const rows = await db
    .select({
      certification: experienceCertifications,
      mission: {
        id: missions.id,
        kind: missions.kind,
        title: missions.title,
      },
      deliverableUrl: missionApplications.deliverableUrl,
      attester: personColumns,
    })
    .from(experienceCertifications)
    .innerJoin(missions, eq(experienceCertifications.missionId, missions.id))
    .innerJoin(
      missionApplications,
      eq(experienceCertifications.applicationId, missionApplications.id),
    )
    .innerJoin(users, eq(experienceCertifications.attesterId, users.id))
    .where(
      and(
        eq(experienceCertifications.recipientId, recipientId),
        isNull(experienceCertifications.revokedAt),
      ),
    )
    .orderBy(desc(experienceCertifications.createdAt));

  return rows.map(({ certification, mission, deliverableUrl, attester }) => {
    const proof = proofOf(certification);
    return {
      id: certification.id,
      mission,
      attester: rowToPerson(attester),
      ...(certification.comment ? { comment: certification.comment } : {}),
      ...(deliverableUrl ? { deliverableUrl } : {}),
      createdAt: certification.createdAt.toISOString(),
      ...(proof ? { proof } : {}),
    };
  });
}
