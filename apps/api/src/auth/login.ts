import { eq } from "drizzle-orm";
import { z } from "zod";
import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { users } from "../db/schema.js";
import { verifyPassword } from "./password.js";

const LEGACY_USER_EMAIL: Record<string, string> = {
  bob: "bob@dev.local",
  alice: "alice@dev.local",
};

export const loginBodySchema = z
  .object({
    email: z.string().email().max(256).optional(),
    userId: z.string().min(1).max(256).optional(),
    password: z.string().min(1).max(256),
  })
  .refine((data) => Boolean(data.email?.trim() || data.userId?.trim()), {
    message: "email_or_user_id_required",
  });

export type LoginBody = z.infer<typeof loginBodySchema>;

export function resolveLoginEmail(body: LoginBody): string | null {
  const email = body.email?.trim().toLowerCase();
  if (email) return email;
  const legacy = body.userId?.trim().toLowerCase();
  if (!legacy) return null;
  return LEGACY_USER_EMAIL[legacy] ?? null;
}

export function isMvpPasswordFallbackEnabled(): boolean {
  const appEnv = process.env.APP_ENV?.trim().toLowerCase();
  if (appEnv === "production" || appEnv === "staging") return false;
  if (process.env.NODE_ENV === "production" && appEnv !== "development") {
    return false;
  }
  return Boolean(process.env.MVP_LOGIN_PASSWORD?.trim());
}

export type LoginSuccess = {
  userId: string;
  role: UserRole;
};

export async function authenticateWithDatabase(
  db: AppDatabase,
  email: string,
  password: string,
): Promise<LoginSuccess | "invalid_credentials"> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const user = rows[0];
  if (!user) return "invalid_credentials";
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return "invalid_credentials";
  return { userId: user.email, role: user.role };
}

export function authenticateWithMvpFallback(
  body: LoginBody,
): LoginSuccess | "invalid_credentials" | "login_not_configured" {
  const expected = process.env.MVP_LOGIN_PASSWORD?.trim();
  if (!expected) return "login_not_configured";
  if (body.password !== expected) return "invalid_credentials";
  const email = resolveLoginEmail(body);
  if (!email) return "invalid_credentials";
  const legacyId = body.userId?.trim() ?? email.split("@")[0] ?? email;
  const mentorIds = process.env.MVP_MENTOR_USER_IDS?.trim();
  const mentors = new Set(
    (mentorIds && mentorIds.length > 0 ? mentorIds.split(",") : ["alice"])
      .map((id) => id.trim())
      .filter(Boolean),
  );
  const role: UserRole = mentors.has(legacyId) ? "mentor" : "student";
  return { userId: email, role };
}
