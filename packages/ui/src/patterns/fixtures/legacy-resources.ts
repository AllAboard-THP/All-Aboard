import { legacySubjects } from "./legacy-subjects";

export type LegacyResource = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorInitials: string;
  subjectSlug: string;
  tags: string[];
  timeAgo: string;
};

const js = legacySubjects.find((s) => s.slug === "javascript")!;
const db = legacySubjects.find((s) => s.slug === "bases-de-donnees")!;
const py = legacySubjects.find((s) => s.slug === "python")!;

export const legacyResources: LegacyResource[] = [
  {
    id: "1",
    title: "Guide complet des hooks React",
    excerpt:
      "Un parcours pas à pas pour maîtriser useState, useEffect, useMemo et les pièges courants des dépendances.",
    authorName: "Noah K.",
    authorInitials: "NK",
    subjectSlug: js.slug,
    tags: ["react", "hooks"],
    timeAgo: "il y a 2 jours",
  },
  {
    id: "2",
    title: "Modéliser un schéma PostgreSQL pour débutants",
    excerpt:
      "Tables, clés étrangères et migrations : une base solide avant d'écrire la moindre requête.",
    authorName: "Inès P.",
    authorInitials: "IP",
    subjectSlug: db.slug,
    tags: ["sql", "postgres"],
    timeAgo: "il y a 5 jours",
  },
  {
    id: "3",
    title: "Découper un script Python en modules",
    excerpt:
      "Organiser imports, packages et tests quand un projet dépasse les 200 lignes.",
    authorName: "Mehdi S.",
    authorInitials: "MS",
    subjectSlug: py.slug,
    tags: ["python", "structure"],
    timeAgo: "il y a 1 semaine",
  },
];

export const legacyResourcesEn: LegacyResource[] = [
  {
    id: "1",
    title: "Complete guide to React hooks",
    excerpt:
      "A step-by-step walkthrough of useState, useEffect, useMemo and common dependency pitfalls.",
    authorName: "Noah K.",
    authorInitials: "NK",
    subjectSlug: js.slug,
    tags: ["react", "hooks"],
    timeAgo: "2 days ago",
  },
  {
    id: "2",
    title: "Model a PostgreSQL schema for beginners",
    excerpt:
      "Tables, foreign keys and migrations — a solid base before writing your first query.",
    authorName: "Inès P.",
    authorInitials: "IP",
    subjectSlug: db.slug,
    tags: ["sql", "postgres"],
    timeAgo: "5 days ago",
  },
  {
    id: "3",
    title: "Split a Python script into modules",
    excerpt:
      "Organize imports, packages and tests when a project grows beyond 200 lines.",
    authorName: "Mehdi S.",
    authorInitials: "MS",
    subjectSlug: py.slug,
    tags: ["python", "structure"],
    timeAgo: "1 week ago",
  },
];
