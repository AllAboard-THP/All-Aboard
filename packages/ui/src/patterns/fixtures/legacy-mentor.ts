export type MentorHelpPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  subjectName: string;
  subjectColor: string;
  title: string;
  excerpt: string;
  timeAgo: string;
};

export type MentorPendingResource = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorInitials: string;
  subjectName: string;
  subjectColor: string;
  tags: string[];
  timeAgo: string;
};

export type MentorDashboardFixture = {
  publishedCount: number;
  pendingCount: number;
  helpCount: number;
  helpPosts: MentorHelpPost[];
  pendingResources: MentorPendingResource[];
};

export const legacyMentorDashboard: MentorDashboardFixture = {
  publishedCount: 11,
  pendingCount: 3,
  helpCount: 2,
  helpPosts: [
    {
      id: "1",
      authorName: "Emma V.",
      authorInitials: "EV",
      subjectName: "DevOps & Cloud",
      subjectColor: "#22d3ee",
      title: "Docker compose — ports déjà utilisés",
      excerpt:
        "Mon stack ne démarre plus depuis que j'ai changé de machine WSL…",
      timeAgo: "il y a 45 min",
    },
    {
      id: "2",
      authorName: "Théo N.",
      authorInitials: "TN",
      subjectName: "Algorithmique",
      subjectColor: "#fb923c",
      title: "Complexité d'un tri fusion mal implémenté",
      excerpt: "Mon merge sort dépasse O(n log n) sur de gros tableaux.",
      timeAgo: "il y a 2 h",
    },
  ],
  pendingResources: [
    {
      id: "1",
      title: "Fiche révision OWASP Top 10",
      excerpt:
        "Synthèse des vulnérabilités les plus fréquentes avec exemples concrets.",
      authorName: "Karim N.",
      authorInitials: "KN",
      subjectName: "Cybersécurité",
      subjectColor: "#c084fc",
      tags: ["owasp", "secu"],
      timeAgo: "il y a 5 h",
    },
    {
      id: "2",
      title: "Intro aux CTE en SQL",
      excerpt: "WITH, récursivité et cas d'usage pour des requêtes lisibles.",
      authorName: "Sofia T.",
      authorInitials: "ST",
      subjectName: "Bases de données",
      subjectColor: "#a78bfa",
      tags: ["sql", "cte"],
      timeAgo: "hier",
    },
    {
      id: "3",
      title: "Premiers pas avec FastAPI",
      excerpt: "Routes, pydantic et tests HTTP pour un mini CRUD.",
      authorName: "Noah K.",
      authorInitials: "NK",
      subjectName: "Python",
      subjectColor: "#60a5fa",
      tags: ["python", "api"],
      timeAgo: "il y a 2 j",
    },
  ],
};

export const legacyMentorDashboardEn: MentorDashboardFixture = {
  publishedCount: 11,
  pendingCount: 3,
  helpCount: 2,
  helpPosts: [
    {
      id: "1",
      authorName: "Emma V.",
      authorInitials: "EV",
      subjectName: "DevOps & Cloud",
      subjectColor: "#22d3ee",
      title: "Docker compose — ports already in use",
      excerpt: "My stack won't start since I switched WSL machines…",
      timeAgo: "45 min ago",
    },
    {
      id: "2",
      authorName: "Théo N.",
      authorInitials: "TN",
      subjectName: "Algorithms",
      subjectColor: "#fb923c",
      title: "Merge sort complexity gone wrong",
      excerpt: "My merge sort exceeds O(n log n) on large arrays.",
      timeAgo: "2 h ago",
    },
  ],
  pendingResources: [
    {
      id: "1",
      title: "OWASP Top 10 cheat sheet",
      excerpt: "Summary of the most common vulnerabilities with examples.",
      authorName: "Karim N.",
      authorInitials: "KN",
      subjectName: "Cybersecurity",
      subjectColor: "#c084fc",
      tags: ["owasp", "security"],
      timeAgo: "5 h ago",
    },
    {
      id: "2",
      title: "Introduction to SQL CTEs",
      excerpt: "WITH, recursion and use cases for readable queries.",
      authorName: "Sofia T.",
      authorInitials: "ST",
      subjectName: "Databases",
      subjectColor: "#a78bfa",
      tags: ["sql", "cte"],
      timeAgo: "yesterday",
    },
    {
      id: "3",
      title: "Getting started with FastAPI",
      excerpt: "Routes, pydantic and HTTP tests for a tiny CRUD.",
      authorName: "Noah K.",
      authorInitials: "NK",
      subjectName: "Python",
      subjectColor: "#60a5fa",
      tags: ["python", "api"],
      timeAgo: "2 d ago",
    },
  ],
};
