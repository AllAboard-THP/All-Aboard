import { and, eq } from "drizzle-orm";
import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../../db/client.js";
import { oauthAccounts, users } from "../../db/schema.js";
import {
  loadUserByEmail,
  loadUserById,
} from "../../services/user-profile.js";
import type { GoogleUserProfile } from "./google-client.js";

export const GOOGLE_OAUTH_PROVIDER = "google";

export type LinkGoogleUserResult = {
  userId: string;
  role: UserRole;
  cguAcceptedAt: Date | null;
  isNewUser: boolean;
};

export type LinkGoogleUserError =
  | "email_not_verified"
  | "database_unavailable";

export async function linkGoogleUser(
  db: AppDatabase,
  profile: GoogleUserProfile,
): Promise<LinkGoogleUserResult | LinkGoogleUserError> {
  if (!profile.emailVerified) {
    return "email_not_verified";
  }

  const linked = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, GOOGLE_OAUTH_PROVIDER),
        eq(oauthAccounts.providerAccountId, profile.sub),
      ),
    )
    .limit(1);

  if (linked[0]) {
    const user = await loadUserById(db, linked[0].userId);
    if (!user) return "database_unavailable";
    return {
      userId: user.email,
      role: user.role,
      cguAcceptedAt: user.cguAcceptedAt,
      isNewUser: false,
    };
  }

  const email = profile.email.trim().toLowerCase();
  const existing = await loadUserByEmail(db, email);
  if (existing) {
    await db.insert(oauthAccounts).values({
      userId: existing.id,
      provider: GOOGLE_OAUTH_PROVIDER,
      providerAccountId: profile.sub,
      email,
    });
    return {
      userId: existing.email,
      role: existing.role,
      cguAcceptedAt: existing.cguAcceptedAt,
      isNewUser: false,
    };
  }

  const now = new Date();
  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash: null,
      role: "student",
      fullName: profile.name?.trim() || null,
      avatarUrl: profile.picture?.trim() || null,
      cguAcceptedAt: null,
      updatedAt: now,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      cguAcceptedAt: users.cguAcceptedAt,
    });

  const row = inserted[0];
  if (!row) return "database_unavailable";

  await db.insert(oauthAccounts).values({
    userId: row.id,
    provider: GOOGLE_OAUTH_PROVIDER,
    providerAccountId: profile.sub,
    email,
  });

  return {
    userId: row.email,
    role: row.role,
    cguAcceptedAt: row.cguAcceptedAt,
    isNewUser: true,
  };
}
