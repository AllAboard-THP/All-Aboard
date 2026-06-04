import { eq } from "drizzle-orm";
import { z } from "zod";
import type { UserRole } from "@allaboard/types";
import type { AppDatabase } from "../db/client.js";
import { users } from "../db/schema.js";
import { hashPassword } from "./password.js";

export const registerBodySchema = z.object({
  email: z.string().email().max(256),
  password: z.string().min(8).max(256),
  passwordConfirmation: z.string().min(8).max(256).optional(),
  fullName: z.string().min(1).max(200),
  educationLevel: z.string().max(64).optional(),
  headline: z.string().max(200).optional(),
  acceptCgu: z.literal(true),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export type RegisterResult =
  | { userId: string; role: UserRole }
  | "invalid_body"
  | "email_taken"
  | "database_unavailable";

export async function registerUser(
  db: AppDatabase,
  body: RegisterBody,
): Promise<RegisterResult> {
  if (
    body.passwordConfirmation !== undefined &&
    body.password !== body.passwordConfirmation
  ) {
    return "invalid_body";
  }

  const email = body.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) return "email_taken";

  const passwordHash = await hashPassword(body.password);
  const now = new Date();
  const inserted = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "student",
      fullName: body.fullName.trim(),
      educationLevel: body.educationLevel?.trim() || null,
      headline: body.headline?.trim() || null,
      cguAcceptedAt: now,
      updatedAt: now,
    })
    .returning({ email: users.email, role: users.role });

  const row = inserted[0];
  if (!row) return "database_unavailable";
  return { userId: row.email, role: row.role };
}
