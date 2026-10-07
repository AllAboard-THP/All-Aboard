import { and, eq, lt } from "drizzle-orm";
import type { AppDatabase } from "../../db/client.js";
import { webauthnChallenges } from "../../db/schema.js";
import { challengeTtlMs } from "./config.js";

export type ChallengeType = "registration" | "authentication";

export type RegistrationChallengeMetadata = {
  mode?: "add";
  fullName?: string;
  email?: string;
  acceptCgu?: boolean;
  webauthnUserId: string;
};

export async function saveChallenge(
  db: AppDatabase,
  params: {
    challenge: string;
    type: ChallengeType;
    userId?: string | null;
    metadata?: RegistrationChallengeMetadata | null;
  },
): Promise<void> {
  const expiresAt = new Date(Date.now() + challengeTtlMs());
  await db.insert(webauthnChallenges).values({
    challenge: params.challenge,
    type: params.type,
    userId: params.userId ?? null,
    metadata: params.metadata ?? null,
    expiresAt,
  });
}

export async function consumeChallenge(
  db: AppDatabase,
  challenge: string,
  type: ChallengeType,
): Promise<{
  userId: string | null;
  metadata: RegistrationChallengeMetadata | null;
} | null> {
  await db
    .delete(webauthnChallenges)
    .where(lt(webauthnChallenges.expiresAt, new Date()));

  const rows = await db
    .select()
    .from(webauthnChallenges)
    .where(
      and(
        eq(webauthnChallenges.challenge, challenge),
        eq(webauthnChallenges.type, type),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db
      .delete(webauthnChallenges)
      .where(eq(webauthnChallenges.id, row.id));
    return null;
  }

  await db
    .delete(webauthnChallenges)
    .where(eq(webauthnChallenges.id, row.id));

  return {
    userId: row.userId,
    metadata: row.metadata as RegistrationChallengeMetadata | null,
  };
}
