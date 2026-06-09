export type StudentHelpRequestPreview = {
  id: string;
  title: string;
  subjectName: string;
  subjectColor: string;
  timeAgo: string;
};

export type StudentResourcePreview = {
  id: string;
  title: string;
  excerpt: string;
  timeAgo: string;
};

export type StudentSubjectPreview = {
  slug: string;
  name: string;
  color: string;
  progressLabel: string;
};

export type StudentUpcomingTeaser = {
  id: string;
  title: string;
  description: string;
};

export type StudentDashboardFixture = {
  firstName: string;
  fullName: string;
  initials: string;
  dateLabel: string;
  postsCount: number;
  repliesCount: number;
  communityRating: string;
  helpRequests: StudentHelpRequestPreview[];
  resources: StudentResourcePreview[];
  subjects: StudentSubjectPreview[];
  upcoming: StudentUpcomingTeaser[];
  unansweredCount: number;
};

export const studentDashboardFixtureFr: StudentDashboardFixture = {
  firstName: "Inès",
  fullName: "Inès P.",
  initials: "IP",
  dateLabel: "9 juin 2026",
  postsCount: 7,
  repliesCount: 19,
  communityRating: "4.6",
  helpRequests: [
    {
      id: "1",
      title: "Jointure SQL qui duplique mes lignes",
      subjectName: "Bases de données",
      subjectColor: "#a78bfa",
      timeAgo: "il y a 4 jours",
    },
  ],
  resources: [
    {
      id: "1",
      title: "Modéliser un schéma PostgreSQL pour débutants",
      excerpt: "Tables, clés étrangères et migrations pour poser une base solide.",
      timeAgo: "il y a 5 jours",
    },
    {
      id: "2",
      title: "Découper un script Python en modules",
      excerpt: "Organiser imports, packages et tests au-delà de 200 lignes.",
      timeAgo: "il y a 1 semaine",
    },
  ],
  subjects: [
    {
      slug: "bases-de-donnees",
      name: "Bases de données",
      color: "#a78bfa",
      progressLabel: "En cours",
    },
    {
      slug: "python",
      name: "Python",
      color: "#60a5fa",
      progressLabel: "En cours",
    },
  ],
  upcoming: [
    {
      id: "events",
      title: "Événements communautaires",
      description: "Ateliers live et sessions d'entraide programmées sur le calendrier.",
    },
    {
      id: "messages",
      title: "Messagerie enrichie",
      description: "Filtrer les conversations par matière et retrouver un fil plus vite.",
    },
  ],
  unansweredCount: 0,
};

export const studentDashboardFixtureEn: StudentDashboardFixture = {
  firstName: "Inès",
  fullName: "Inès P.",
  initials: "IP",
  dateLabel: "June 9, 2026",
  postsCount: 7,
  repliesCount: 19,
  communityRating: "4.6",
  helpRequests: [
    {
      id: "1",
      title: "SQL join duplicating my rows",
      subjectName: "Databases",
      subjectColor: "#a78bfa",
      timeAgo: "4 days ago",
    },
  ],
  resources: [
    {
      id: "1",
      title: "Model a PostgreSQL schema for beginners",
      excerpt: "Tables, foreign keys and migrations before writing queries.",
      timeAgo: "5 days ago",
    },
    {
      id: "2",
      title: "Split a Python script into modules",
      excerpt: "Organize imports, packages and tests beyond 200 lines.",
      timeAgo: "1 week ago",
    },
  ],
  subjects: [
    {
      slug: "bases-de-donnees",
      name: "Databases",
      color: "#a78bfa",
      progressLabel: "In progress",
    },
    {
      slug: "python",
      name: "Python",
      color: "#60a5fa",
      progressLabel: "In progress",
    },
  ],
  upcoming: [
    {
      id: "events",
      title: "Community events",
      description: "Live workshops and scheduled peer-help sessions on the calendar.",
    },
    {
      id: "messages",
      title: "Richer messaging",
      description: "Filter conversations by subject and find a thread faster.",
    },
  ],
  unansweredCount: 0,
};
