import { eq } from "drizzle-orm";
import { hashPassword } from "../auth/password.js";
import type { AppDatabase } from "./client.js";
import { subjects, users } from "./schema.js";
import {
  demoMentorSubjectLinks,
  demoSeedUsers,
  extraSeedSubjects,
} from "./seed-demo-data.js";
import { seedDemoContent, seedMentorSubjects } from "./seed-demo.js";

export type SeedUserSpec = {
  email: string;
  role: "student" | "mentor" | "admin";
  password: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  educationLevel?: string;
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
    ...extraSeedSubjects(),
  ];
}

function resolveSeedPassword(): string {
  return (
    process.env.DEV_SEED_PASSWORD?.trim() ??
    process.env.MVP_LOGIN_PASSWORD?.trim() ??
    ""
  );
}

/** Comptes dev/CI documentés — mots de passe via env, jamais en repo. */
export function defaultSeedUsers(): SeedUserSpec[] {
  const password = resolveSeedPassword();
  if (!password) return [];
  return [
    {
      email: "bob@dev.local",
      role: "student",
      password,
      fullName: "Bob Dev",
      headline: "Étudiant THP — Full-stack en formation",
      educationLevel: "Bootcamp THP",
      bio: "J'apprends Rails, React et l'écosystème Node. Je pose surtout des questions sur les migrations API et le monorepo.",
      avatarUrl:
        "https://images.unsplash.com/photo-1527983851525-d7758846f900?w=100&h=100&fit=crop",
    },
    {
      email: "alice@dev.local",
      role: "mentor",
      password,
      fullName: "Alice Mentor",
      headline: "Lead dev — Mentor React, TypeScript & Rails",
      educationLevel: "Master Informatique",
      bio: "Mentor sur All-Aboard depuis le MVP. J'aide sur React, TypeScript, Rails et l'architecture BFF/API.",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop",
      certificationTags: ["react", "typescript", "rails", "javascript"],
    },
    {
      email: "admin@dev.local",
      role: "admin",
      password,
      fullName: "Admin Dev",
      headline: "Administrateur plateforme",
      educationLevel: "N/A",
      bio: "Compte admin pour modération, gestion utilisateurs et matières.",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    },
  ];
}

/** Personas démo supplémentaires (même mot de passe que bob/alice). */
export function allDemoSeedUsers(password: string): SeedUserSpec[] {
  return demoSeedUsers().map((user) => ({
    ...user,
    password,
  }));
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
  const cguAcceptedAt = new Date();
  for (const spec of specs) {
    const passwordHash = await hashPassword(spec.password);
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, spec.email))
      .limit(1);
    const certificationTags = spec.certificationTags ?? [];
    const fullName = spec.fullName?.trim() || null;
    const profileFields = {
      passwordHash,
      role: spec.role,
      certificationTags,
      fullName,
      headline: spec.headline?.trim() || null,
      bio: spec.bio?.trim() || null,
      avatarUrl: spec.avatarUrl?.trim() || null,
      educationLevel: spec.educationLevel?.trim() || null,
      cguAcceptedAt,
      updatedAt: new Date(),
    };
    if (existing.length > 0) {
      await db
        .update(users)
        .set(profileFields)
        .where(eq(users.email, spec.email));
    } else {
      await db.insert(users).values({
        email: spec.email,
        ...profileFields,
      });
    }
  }
}

/** @deprecated Use seedMentorSubjects — kept for tests. */
export async function seedMentorSubjectsForAlice(
  db: AppDatabase,
): Promise<void> {
  await seedMentorSubjects(db, demoMentorSubjectLinks());
}

export async function runSeedIfConfigured(db: AppDatabase | null): Promise<void> {
  if (!db) return;

  const subjectSpecs = defaultSeedSubjects();
  await seedSubjects(db, subjectSpecs);
  console.log(`api: seeded ${subjectSpecs.length} subject(s)`);

  const password = resolveSeedPassword();
  if (!password) {
    console.warn(
      "api: DEV_SEED_PASSWORD or MVP_LOGIN_PASSWORD unset — skipping user/demo seed",
    );
    return;
  }

  const coreUsers = defaultSeedUsers();
  const demoUsers = allDemoSeedUsers(password);
  const allUsers = [...coreUsers, ...demoUsers];
  await seedUsers(db, allUsers);
  console.log(`api: seeded ${allUsers.length} user(s)`);

  await seedMentorSubjects(db, demoMentorSubjectLinks());
  await seedDemoContent(db);
}

export async function runFullSeed(db: AppDatabase): Promise<void> {
  await runSeedIfConfigured(db);
}
