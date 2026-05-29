export type LegacyProfilePost = {
  id: string;
  title: string;
  excerpt: string;
  timeAgo: string;
};

export type LegacyProfileReply = {
  id: string;
  postTitle: string;
  body: string;
  timeAgo: string;
};

export type LegacyProfile = {
  name: string;
  initials: string;
  headline: string;
  educationLevel: string;
  bio: string;
  postsCount: number;
  repliesCount: number;
  rating: string;
  posts: LegacyProfilePost[];
  replies: LegacyProfileReply[];
};

export const legacyProfile: LegacyProfile = {
  name: "Inès P.",
  initials: "IP",
  headline: "Étudiante data & SQL, curieuse de Python",
  educationLevel: "Licence MIASHS",
  bio: "Je partage surtout des retours SQL et des bonnes pratiques Python. Toujours partante pour débugger une jointure mal fichue.",
  postsCount: 7,
  repliesCount: 19,
  rating: "4.6",
  posts: [
    {
      id: "1",
      title: "Jointure SQL qui duplique mes lignes",
      excerpt:
        "Quand je fais un LEFT JOIN sur deux tables, j'obtiens deux fois plus de résultats…",
      timeAgo: "il y a 4 jours",
    },
    {
      id: "2",
      title: "Boucle for vs map en Python",
      excerpt: "Dans quel cas préférer une list comprehension à une boucle classique ?",
      timeAgo: "il y a 10 jours",
    },
  ],
  replies: [
    {
      id: "1",
      postTitle: "Normaliser une table avant migration",
      body: "Commence par isoler les colonnes répétées dans une table de référence, puis migre les FK.",
      timeAgo: "il y a 2 jours",
    },
  ],
};

export const legacyProfileEn: LegacyProfile = {
  name: "Inès P.",
  initials: "IP",
  headline: "Data & SQL student, curious about Python",
  educationLevel: "Applied math & social sciences (Bachelor)",
  bio: "I mostly share SQL tips and Python best practices. Always happy to debug a broken join.",
  postsCount: 7,
  repliesCount: 19,
  rating: "4.6",
  posts: [
    {
      id: "1",
      title: "SQL join duplicating my rows",
      excerpt:
        "When I LEFT JOIN two tables I get twice as many rows as expected…",
      timeAgo: "4 days ago",
    },
    {
      id: "2",
      title: "for loop vs map in Python",
      excerpt: "When should I prefer a list comprehension over a classic loop?",
      timeAgo: "10 days ago",
    },
  ],
  replies: [
    {
      id: "1",
      postTitle: "Normalize a table before migration",
      body: "Start by isolating repeated columns in a reference table, then migrate FKs.",
      timeAgo: "2 days ago",
    },
  ],
};
