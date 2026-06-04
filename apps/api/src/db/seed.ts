import { and, eq } from "drizzle-orm";
import { hashPassword } from "../auth/password.js";
import type { AppDatabase } from "./client.js";
import { mentorSubjects, subjects, users } from "./schema.js";

export type SeedUserSpec = {
  email: string;
  role: "student" | "mentor" | "admin";
  password: string;
  fullName?: string;
  certificationTags?: string[];
};

export type SeedSubjectSpec = {
  name: string;
  slug: string;
  icon: string;
  accentColor: string;
  description?: string;
};

/** Catalogue subjects aligné thp-final / explore. */
export function defaultSeedSubjects(): SeedSubjectSpec[] {
  return [
    {
      name: "JavaScript",
      slug: "javascript",
      icon: "js",
      accentColor: "#f7df1e",
      description: "Langage du web côté client et Node.js",
    },
    {
      name: "Ruby",
      slug: "ruby",
      icon: "gem",
      accentColor: "#cc342d",
      description: "Langage orienté objet, base de Rails",
    },
    {
      name: "Rails",
      slug: "rails",
      icon: "train",
      accentColor: "#d30001",
      description: "Framework web Ruby",
    },
    {
      name: "React",
      slug: "react",
      icon: "atom",
      accentColor: "#61dafb",
      description: "Bibliothèque UI composants",
    },
    {
      name: "HTML & CSS",
      slug: "html-css",
      icon: "code",
      accentColor: "#e34c26",
      description: "Structure et style des pages web",
    },
  ];
}

/** Comptes dev/CI documentés — mots de passe via env, jamais en repo. */
export function defaultSeedUsers(): SeedUserSpec[] {
  const password =
    process.env.DEV_SEED_PASSWORD?.trim() ??
    process.env.MVP_LOGIN_PASSWORD?.trim() ??
    "";
  if (!password) return [];
  return [
    {
      email: "bob@dev.local",
      role: "student",
      password,
      fullName: "Bob Dev",
    },
    {
      email: "alice@dev.local",
      role: "mentor",
      password,
      fullName: "Alice Mentor",
      certificationTags: ["react", "typescript", "rails"],
    },
    {
      email: "admin@dev.local",
      role: "admin",
      password,
      fullName: "Admin Dev",
    },
  ];
}

export async function seedSubjects(
  db: AppDatabase,
  specs: SeedSubjectSpec[],
): Promise<void> {
  for (const spec of specs) {
    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.slug, spec.slug))
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(subjects)
        .set({
          name: spec.name,
          icon: spec.icon,
          accentColor: spec.accentColor,
          description: spec.description,
          updatedAt: new Date(),
        })
        .where(eq(subjects.slug, spec.slug));
    } else {
      await db.insert(subjects).values({
        name: spec.name,
        slug: spec.slug,
        icon: spec.icon,
        accentColor: spec.accentColor,
        description: spec.description,
      });
    }
  }
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
    const fullName = spec.fullName?.trim() || null;
    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          passwordHash,
          role: spec.role,
          certificationTags,
          fullName,
          updatedAt: new Date(),
        })
        .where(eq(users.email, spec.email));
    } else {
      await db.insert(users).values({
        email: spec.email,
        passwordHash,
        role: spec.role,
        certificationTags,
        fullName,
      });
    }
  }
}

export async function seedMentorSubjectsForAlice(
  db: AppDatabase,
): Promise<void> {
  const aliceRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "alice@dev.local"))
    .limit(1);
  const aliceId = aliceRows[0]?.id;
  if (!aliceId) return;

  const reactRows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.slug, "react"))
    .limit(1);
  const reactId = reactRows[0]?.id;
  if (!reactId) return;

  const existing = await db
    .select({ id: mentorSubjects.id })
    .from(mentorSubjects)
    .where(
      and(
        eq(mentorSubjects.userId, aliceId),
        eq(mentorSubjects.subjectId, reactId),
      ),
    )
    .limit(1);
  if (existing.length > 0) return;

  await db.insert(mentorSubjects).values({
    userId: aliceId,
    subjectId: reactId,
  });
}

export async function runSeedIfConfigured(db: AppDatabase | null): Promise<void> {
  if (!db) return;

  const subjectSpecs = defaultSeedSubjects();
  await seedSubjects(db, subjectSpecs);
  console.log(`api: seeded ${subjectSpecs.length} subject(s)`);

  const specs = defaultSeedUsers();
  if (specs.length === 0) {
    console.warn(
      "api: DEV_SEED_PASSWORD or MVP_LOGIN_PASSWORD unset — skipping user seed",
    );
    return;
  }
  await seedUsers(db, specs);
  console.log(`api: seeded ${specs.length} user(s)`);
  await seedMentorSubjectsForAlice(db);
}
