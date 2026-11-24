/**
 * Demo missions (#193, ADR 0010): one per type and status, with applications
 * at every stage and a few validated participants.
 *
 * Experience certifications are seeded **without** an `experience.attested`
 * outbox event, so the Intuition publisher never puts demo data on-chain.
 * Profiles show them with the proof still pending.
 */
import { and, eq, inArray } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import {
  experienceCertifications,
  missionApplications,
  missionSkills,
  missions,
  skills,
  users,
} from "./schema.js";

export const SEED_MISSION_IDS = {
  lucasRecipesAuth: "a7000001-0000-4000-8000-000000000001",
  sofiaDataPipeline: "a7000001-0000-4000-8000-000000000002",
  kevinA11yHackathon: "a7000001-0000-4000-8000-000000000003",
  aliceDesignSystem: "a7000001-0000-4000-8000-000000000004",
  nadiaApiAudit: "a7000001-0000-4000-8000-000000000005",
  julienGameJam: "a7000001-0000-4000-8000-000000000006",
  lucasFigmaCancelled: "a7000001-0000-4000-8000-000000000007",
  aliceRails8: "a7000001-0000-4000-8000-000000000008",
} as const;

export const SEED_MISSION_APPLICATION_IDS = {
  hugoRecipes: "a7100001-0000-4000-8000-000000000001",
  marieRecipes: "a7100001-0000-4000-8000-000000000002",
  camilleData: "a7100001-0000-4000-8000-000000000003",
  thomasData: "a7100001-0000-4000-8000-000000000004",
  romainA11y: "a7100001-0000-4000-8000-000000000005",
  leaA11y: "a7100001-0000-4000-8000-000000000006",
  noahA11y: "a7100001-0000-4000-8000-000000000007",
  yanisA11y: "a7100001-0000-4000-8000-000000000008",
  bobDesignSystem: "a7100001-0000-4000-8000-000000000009",
  emmaAudit: "a7100001-0000-4000-8000-000000000010",
  bobAudit: "a7100001-0000-4000-8000-000000000011",
  inesGameJam: "a7100001-0000-4000-8000-000000000012",
  sarahGameJam: "a7100001-0000-4000-8000-000000000013",
  hugoFigma: "a7100001-0000-4000-8000-000000000014",
  noahRails8: "a7100001-0000-4000-8000-000000000015",
  inesRails8: "a7100001-0000-4000-8000-000000000016",
  yanisRails8: "a7100001-0000-4000-8000-000000000017",
} as const;

export const SEED_EXPERIENCE_IDS = {
  romainA11y: "a7200001-0000-4000-8000-000000000001",
  leaA11y: "a7200001-0000-4000-8000-000000000002",
  bobDesignSystem: "a7200001-0000-4000-8000-000000000003",
} as const;

type MissionKind = "personal_project" | "freelance" | "hackathon";
type MissionStatus = "open" | "in_progress" | "completed" | "cancelled";
type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type DemoMissionApplicationSpec = {
  id: string;
  applicantEmail: string;
  message: string;
  status: ApplicationStatus;
  deliverableUrl?: string;
  hoursAgo: number;
  decidedHoursAgo?: number;
  /** Validated by the mission author: creates an experience certification. */
  validation?: { id: string; comment?: string; hoursAgo: number };
};

export type DemoMissionSpec = {
  id: string;
  authorEmail: string;
  kind: MissionKind;
  title: string;
  description: string;
  githubRepoUrl?: string;
  compensation?: string;
  places: number;
  /** Days from now; negative values are in the past. */
  startsInDays?: number;
  endsInDays?: number;
  status: MissionStatus;
  skillSlugs: string[];
  hoursAgo: number;
  applications: DemoMissionApplicationSpec[];
};

const A = SEED_MISSION_APPLICATION_IDS;
const E = SEED_EXPERIENCE_IDS;

export function demoMissions(): DemoMissionSpec[] {
  return [
    {
      id: SEED_MISSION_IDS.lucasRecipesAuth,
      authorEmail: "lucas@dev.local",
      kind: "personal_project",
      title: "Ajouter l'authentification à mon gestionnaire de recettes",
      description:
        "Mon side project (Next.js + Fastify) n'a pas encore de comptes. Je cherche deux personnes pour ajouter l'inscription, la connexion par e-mail et la protection des routes. Je fais une revue de code sur chaque pull request.",
      githubRepoUrl: "https://github.com/allaboard-demo/recipe-box",
      places: 2,
      status: "open",
      skillSlugs: ["react", "typescript", "nodejs"],
      hoursAgo: 30,
      applications: [
        {
          id: A.hugoRecipes,
          applicantEmail: "hugo@dev.local",
          message:
            "J'ai fait l'auth de mon projet de fin de formation avec des cookies httpOnly, j'aimerais m'y remettre avec une vraie revue.",
          status: "pending",
          hoursAgo: 20,
        },
        {
          id: A.marieRecipes,
          applicantEmail: "marie@dev.local",
          message:
            "Je découvre Fastify et je veux apprendre à sécuriser une API. Je suis dispo le soir et le week-end.",
          status: "accepted",
          hoursAgo: 26,
          decidedHoursAgo: 22,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.sofiaDataPipeline,
      authorEmail: "sofia@dev.local",
      kind: "freelance",
      title: "Pipeline de nettoyage de données pour une association",
      description:
        "Une association de quartier exporte ses adhésions depuis trois tableurs différents. Il faut un script Python qui fusionne, dédoublonne et charge le tout dans une base Postgres, avec un rapport des lignes rejetées.",
      compensation: "1 500 € pour 3 semaines, facturé directement à l'association",
      places: 1,
      status: "in_progress",
      skillSlugs: ["python", "sql"],
      hoursAgo: 240,
      applications: [
        {
          id: A.camilleData,
          applicantEmail: "camille@dev.local",
          message:
            "J'ai déjà nettoyé des exports CSV avec pandas pour mon stage. Je peux commencer lundi.",
          status: "accepted",
          deliverableUrl: "https://github.com/allaboard-demo/asso-data-pipeline/pull/4",
          hoursAgo: 220,
          decidedHoursAgo: 200,
        },
        {
          id: A.thomasData,
          applicantEmail: "thomas@dev.local",
          message: "Intéressé, même si je débute en SQL.",
          status: "rejected",
          hoursAgo: 210,
          decidedHoursAgo: 200,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.kevinA11yHackathon,
      authorEmail: "kevin@dev.local",
      kind: "hackathon",
      title: "Hackathon accessibilité, 48 h",
      description:
        "48 heures pour rendre un site associatif utilisable au clavier et au lecteur d'écran. Chaque participant prend une page, corrige les problèmes trouvés par l'audit et documente ses choix.",
      githubRepoUrl: "https://github.com/allaboard-demo/a11y-hackathon",
      places: 4,
      startsInDays: -20,
      endsInDays: -18,
      status: "completed",
      skillSlugs: ["javascript", "react"],
      hoursAgo: 900,
      applications: [
        {
          id: A.romainA11y,
          applicantEmail: "romain@dev.local",
          message: "Je veux apprendre ARIA sur un vrai site, je prends la page d'adhésion.",
          status: "accepted",
          deliverableUrl: "https://github.com/allaboard-demo/a11y-hackathon/pull/12",
          hoursAgo: 860,
          decidedHoursAgo: 840,
          validation: {
            id: E.romainA11y,
            comment:
              "Formulaire d'adhésion entièrement navigable au clavier, avec des messages d'erreur lus par le lecteur d'écran.",
            hoursAgo: 430,
          },
        },
        {
          id: A.leaA11y,
          applicantEmail: "lea@dev.local",
          message: "Partante pour la page d'accueil et le menu.",
          status: "accepted",
          deliverableUrl: "https://github.com/allaboard-demo/a11y-hackathon/pull/15",
          hoursAgo: 850,
          decidedHoursAgo: 840,
          validation: { id: E.leaA11y, hoursAgo: 428 },
        },
        {
          id: A.noahA11y,
          applicantEmail: "noah@dev.local",
          message: "Je peux aider sur les contrastes de couleurs.",
          status: "accepted",
          hoursAgo: 845,
          decidedHoursAgo: 840,
        },
        {
          id: A.yanisA11y,
          applicantEmail: "yanis@dev.local",
          message: "Dispo seulement le samedi.",
          status: "rejected",
          hoursAgo: 842,
          decidedHoursAgo: 840,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.aliceDesignSystem,
      authorEmail: "alice@dev.local",
      kind: "personal_project",
      title: "Refonte du design system de mon portfolio",
      description:
        "Extraire les couleurs, typographies et espacements de mon portfolio dans des tokens, puis reconstruire les boutons et les cartes avec. Storybook est déjà en place.",
      githubRepoUrl: "https://github.com/allaboard-demo/alice-portfolio",
      places: 1,
      status: "completed",
      skillSlugs: ["react", "typescript"],
      hoursAgo: 600,
      applications: [
        {
          id: A.bobDesignSystem,
          applicantEmail: "bob@dev.local",
          message:
            "J'utilise Storybook depuis un mois, j'aimerais travailler sur des tokens avec une vraie revue.",
          status: "accepted",
          deliverableUrl: "https://github.com/allaboard-demo/alice-portfolio/pull/7",
          hoursAgo: 580,
          decidedHoursAgo: 560,
          validation: {
            id: E.bobDesignSystem,
            comment: "Tokens propres et bien nommés, et chaque composant a sa story.",
            hoursAgo: 300,
          },
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.nadiaApiAudit,
      authorEmail: "nadia@dev.local",
      kind: "freelance",
      title: "Audit de sécurité d'une API Express",
      description:
        "Une petite API Express de réservation : vérifier l'authentification, les entrées utilisateur et les en-têtes, puis rédiger un rapport priorisé avec des correctifs proposés.",
      compensation: "800 €, à discuter selon le périmètre",
      places: 1,
      status: "open",
      skillSlugs: ["nodejs", "typescript"],
      hoursAgo: 48,
      applications: [
        {
          id: A.emmaAudit,
          applicantEmail: "emma@dev.local",
          message: "J'ai suivi le module OWASP et je veux le mettre en pratique.",
          status: "pending",
          hoursAgo: 40,
        },
        {
          id: A.bobAudit,
          applicantEmail: "bob@dev.local",
          message:
            "Je connais bien Express. Je peux livrer le rapport en une semaine.",
          status: "pending",
          hoursAgo: 12,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.julienGameJam,
      authorEmail: "julien@dev.local",
      kind: "hackathon",
      title: "Game jam TypeScript, le temps d'un week-end",
      description:
        "Un week-end pour créer un petit jeu jouable dans le navigateur, en TypeScript et sans moteur. Thème annoncé le vendredi soir. Seul ou en duo.",
      places: 10,
      startsInDays: 10,
      endsInDays: 12,
      status: "open",
      skillSlugs: ["typescript", "javascript"],
      hoursAgo: 72,
      applications: [
        {
          id: A.inesGameJam,
          applicantEmail: "ines@dev.local",
          message: "Première game jam, je suis motivée !",
          status: "pending",
          hoursAgo: 50,
        },
        {
          id: A.sarahGameJam,
          applicantEmail: "sarah@dev.local",
          message: "J'ai déjà fait un Snake en canvas, je veux aller plus loin.",
          status: "accepted",
          hoursAgo: 60,
          decidedHoursAgo: 55,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.lucasFigmaCancelled,
      authorEmail: "lucas@dev.local",
      kind: "freelance",
      title: "Intégration d'une maquette Figma en React",
      description:
        "Intégrer une landing page à partir d'une maquette Figma. Le client a mis le projet en pause.",
      compensation: "400 €",
      places: 1,
      status: "cancelled",
      skillSlugs: ["react"],
      hoursAgo: 400,
      applications: [
        {
          id: A.hugoFigma,
          applicantEmail: "hugo@dev.local",
          message: "Je suis à l'aise avec Figma et Tailwind.",
          status: "accepted",
          hoursAgo: 390,
          decidedHoursAgo: 380,
        },
      ],
    },
    {
      id: SEED_MISSION_IDS.aliceRails8,
      authorEmail: "alice@dev.local",
      kind: "freelance",
      title: "Migration d'une app Rails 7 vers Rails 8",
      description:
        "Une application interne de prise de rendez-vous à passer en Rails 8 : mise à jour des gems, remplacement de Sidekiq par Solid Queue, correction des tests qui cassent.",
      githubRepoUrl: "https://github.com/allaboard-demo/booking-rails",
      compensation: "2 000 € pour un mois, à deux",
      places: 2,
      startsInDays: 7,
      status: "open",
      skillSlugs: ["ruby-on-rails", "ruby"],
      hoursAgo: 18,
      applications: [
        {
          id: A.noahRails8,
          applicantEmail: "noah@dev.local",
          message: "J'ai fait la migration Rails 7.1 de mon projet THP, je connais les pièges.",
          status: "pending",
          hoursAgo: 10,
        },
        {
          id: A.inesRails8,
          applicantEmail: "ines@dev.local",
          message: "Je n'ai jamais utilisé Solid Queue mais j'ai envie d'apprendre.",
          status: "pending",
          hoursAgo: 6,
        },
        {
          id: A.yanisRails8,
          applicantEmail: "yanis@dev.local",
          message: "Dispo à temps plein le mois prochain.",
          status: "accepted",
          hoursAgo: 15,
          decidedHoursAgo: 8,
        },
      ],
    },
  ];
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysFromNow(days: number | undefined): Date | null {
  return days === undefined ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function loadUserIds(
  db: AppDatabase,
  emails: string[],
): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.email, emails));
  return new Map(rows.map((row) => [row.email, row.id]));
}

/** Idempotent: missions and applications are upserted by id, validations inserted once. */
export async function seedDemoMissions(db: AppDatabase): Promise<{
  missions: number;
  applications: number;
  experiences: number;
}> {
  const specs = demoMissions();
  const emails = new Set<string>();
  for (const spec of specs) {
    emails.add(spec.authorEmail);
    for (const app of spec.applications) emails.add(app.applicantEmail);
  }
  const userIds = await loadUserIds(db, [...emails]);

  const skillRows = await db.select({ id: skills.id, slug: skills.slug }).from(skills);
  const skillIds = new Map(skillRows.map((row) => [row.slug, row.id]));

  const counts = { missions: 0, applications: 0, experiences: 0 };

  for (const spec of specs) {
    const authorId = userIds.get(spec.authorEmail);
    if (!authorId) continue;

    const createdAt = hoursAgo(spec.hoursAgo);
    const fields = {
      authorId,
      kind: spec.kind,
      title: spec.title,
      description: spec.description,
      githubRepoUrl: spec.githubRepoUrl ?? null,
      compensation: spec.compensation ?? null,
      places: spec.places,
      startsAt: daysFromNow(spec.startsInDays),
      endsAt: daysFromNow(spec.endsInDays),
      status: spec.status,
    };
    await db
      .insert(missions)
      .values({ id: spec.id, ...fields, createdAt, updatedAt: createdAt })
      .onConflictDoUpdate({
        target: missions.id,
        set: { ...fields, updatedAt: new Date() },
      });
    counts.missions += 1;

    for (const slug of spec.skillSlugs) {
      const skillId = skillIds.get(slug);
      if (!skillId) continue;
      await db
        .insert(missionSkills)
        .values({ missionId: spec.id, skillId })
        .onConflictDoNothing();
    }

    for (const app of spec.applications) {
      const applicantId = userIds.get(app.applicantEmail);
      if (!applicantId) continue;

      // A real application by the same person (made in the app) wins over the demo one.
      const [other] = await db
        .select({ id: missionApplications.id })
        .from(missionApplications)
        .where(
          and(
            eq(missionApplications.missionId, spec.id),
            eq(missionApplications.applicantId, applicantId),
          ),
        )
        .limit(1);
      if (other && other.id !== app.id) continue;

      const appCreatedAt = hoursAgo(app.hoursAgo);
      const appFields = {
        message: app.message,
        status: app.status,
        deliverableUrl: app.deliverableUrl ?? null,
        decidedAt:
          app.decidedHoursAgo === undefined ? null : hoursAgo(app.decidedHoursAgo),
      };
      await db
        .insert(missionApplications)
        .values({
          id: app.id,
          missionId: spec.id,
          applicantId,
          ...appFields,
          createdAt: appCreatedAt,
          updatedAt: appCreatedAt,
        })
        .onConflictDoUpdate({
          target: missionApplications.id,
          set: { ...appFields, updatedAt: new Date() },
        });
      counts.applications += 1;

      if (!app.validation) continue;
      // Insert once: never touch publish columns or a withdrawal made in the app.
      const inserted = await db
        .insert(experienceCertifications)
        .values({
          id: app.validation.id,
          missionId: spec.id,
          applicationId: app.id,
          recipientId: applicantId,
          attesterId: authorId,
          comment: app.validation.comment ?? null,
          createdAt: hoursAgo(app.validation.hoursAgo),
        })
        .onConflictDoNothing()
        .returning({ id: experienceCertifications.id });
      counts.experiences += inserted.length;
    }
  }

  return counts;
}
