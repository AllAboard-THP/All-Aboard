import { eq } from "drizzle-orm";
import { hashPassword } from "../auth/password.js";
import type { AppDatabase } from "./client.js";
import { users } from "./schema.js";

export type SeedUserSpec = {
  email: string;
  role: "student" | "mentor";
  password: string;
  certificationTags?: string[];
};

/** Comptes dev/CI documentés — mots de passe via env, jamais en repo. */
export function defaultSeedUsers(): SeedUserSpec[] {
  const password =
    process.env.DEV_SEED_PASSWORD?.trim() ??
    process.env.MVP_LOGIN_PASSWORD?.trim() ??
    "";
  if (!password) return [];
  return [
    { email: "bob@dev.local", role: "student", password },
    {
      email: "alice@dev.local",
      role: "mentor",
      password,
      certificationTags: ["react", "typescript", "rails"],
    },
  ];
}

export async function seedUsers(db: AppDatabase, specs: SeedUserSpec[]): Promise<void> {
  for (const spec of specs) {
    const passwordHash = await hashPassword(spec.password);
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);
    const certificationTags = spec.certificationTags ?? [];
    if (existing.length > 0) {
      await db
        .update(users)
        .set({ passwordHash, role: spec.role, certificationTags })
        .where(eq(users.email, spec.email));
    } else {
      await db.insert(users).values({
        email: spec.email,
        passwordHash,
        role: spec.role,
        certificationTags,
      });
    }
  }
}

export async function runSeedIfConfigured(db: AppDatabase | null): Promise<void> {
  if (!db) return;
  const specs = defaultSeedUsers();
  if (specs.length === 0) {
    console.warn(
      "api: DEV_SEED_PASSWORD or MVP_LOGIN_PASSWORD unset — skipping user seed",
    );
    return;
  }
  await seedUsers(db, specs);
  console.log(`api: seeded ${specs.length} user(s)`);
}
