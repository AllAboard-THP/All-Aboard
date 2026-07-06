export type DashboardTodoKind = "helpRequest" | "message" | "resource";

export type DashboardTodoItem = {
  id: string;
  kind: DashboardTodoKind;
  title: string;
  subtitle?: string;
  href: string;
  timeAgo?: string;
};

export type DashboardActivityKind = "reply" | "resource";

export type DashboardActivityItem = {
  id: string;
  kind: DashboardActivityKind;
  title: string;
  excerpt?: string;
  href: string;
  timeAgo: string;
};

export type DashboardShortcutId = "subjects" | "resources" | "profile";

export type DashboardShortcut = {
  id: DashboardShortcutId;
  href: string;
};

export type StudentDashboardFixture = {
  firstName: string;
  fullName: string;
  initials: string;
  dateLabel: string;
  summaryLine?: string;
  todos: DashboardTodoItem[];
  recentActivity: DashboardActivityItem[];
  shortcuts: DashboardShortcut[];
  badgeCounts?: {
    dashboard?: number;
    feed?: number;
    messages?: number;
  };
};

export const studentDashboardFixtureFr: StudentDashboardFixture = {
  firstName: "Inès",
  fullName: "Inès Martin",
  initials: "IM",
  dateLabel: "17 juin 2026",
  summaryLine: "1 demande active · 1 message non lu",
  todos: [
    {
      id: "todo-1",
      kind: "helpRequest",
      title: "Jointure SQL qui duplique mes lignes",
      subtitle: "2 nouvelles réponses",
      href: "/requests/1",
      timeAgo: "il y a 4 jours",
    },
    {
      id: "todo-2",
      kind: "message",
      title: "Message d'Alice (mentor)",
      subtitle: "Non lu",
      href: "/messages",
    },
    {
      id: "todo-3",
      kind: "resource",
      title: "Ressource validée sur Python",
      subtitle: "Disponible dans tes matières",
      href: "/resources",
      timeAgo: "il y a 1 semaine",
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      kind: "reply",
      title: "Bob a répondu à « Jointure SQL… »",
      href: "/requests/1",
      timeAgo: "il y a 2 h",
    },
    {
      id: "act-2",
      kind: "resource",
      title: "Nouvelle ressource : PostgreSQL pour débutants",
      excerpt: "Tables, clés étrangères et migrations.",
      href: "/resources",
      timeAgo: "il y a 5 jours",
    },
    {
      id: "act-3",
      kind: "reply",
      title: "Alice a commenté « Hooks React avancés »",
      href: "/requests/2",
      timeAgo: "il y a 1 j",
    },
  ],
  shortcuts: [
    { id: "subjects", href: "/explore" },
    { id: "resources", href: "/resources" },
    { id: "profile", href: "/profile" },
  ],
  badgeCounts: {
    dashboard: 2,
    feed: 3,
    messages: 1,
  },
};

export const studentDashboardFixtureEn: StudentDashboardFixture = {
  firstName: "Inès",
  fullName: "Inès Martin",
  initials: "IM",
  dateLabel: "June 17, 2026",
  summaryLine: "1 active request · 1 unread message",
  todos: [
    {
      id: "todo-1",
      kind: "helpRequest",
      title: "SQL join duplicating my rows",
      subtitle: "2 new replies",
      href: "/requests/1",
      timeAgo: "4 days ago",
    },
    {
      id: "todo-2",
      kind: "message",
      title: "Message from Alice (mentor)",
      subtitle: "Unread",
      href: "/messages",
    },
    {
      id: "todo-3",
      kind: "resource",
      title: "Resource approved for Python",
      subtitle: "Available in your subjects",
      href: "/resources",
      timeAgo: "1 week ago",
    },
  ],
  recentActivity: [
    {
      id: "act-1",
      kind: "reply",
      title: "Bob replied to “SQL join…”",
      href: "/requests/1",
      timeAgo: "2 h ago",
    },
    {
      id: "act-2",
      kind: "resource",
      title: "New resource: PostgreSQL for beginners",
      excerpt: "Tables, foreign keys and migrations.",
      href: "/resources",
      timeAgo: "5 days ago",
    },
    {
      id: "act-3",
      kind: "reply",
      title: "Alice commented on “Advanced React hooks”",
      href: "/requests/2",
      timeAgo: "1 d ago",
    },
  ],
  shortcuts: [
    { id: "subjects", href: "/explore" },
    { id: "resources", href: "/resources" },
    { id: "profile", href: "/profile" },
  ],
  badgeCounts: {
    dashboard: 2,
    feed: 3,
    messages: 1,
  },
};

export const studentDashboardFixtureEmptyFr: StudentDashboardFixture = {
  firstName: "Inès",
  fullName: "Inès Martin",
  initials: "IM",
  dateLabel: "17 juin 2026",
  todos: [],
  recentActivity: [],
  shortcuts: studentDashboardFixtureFr.shortcuts,
};

export const studentDashboardFixtureEmptyEn: StudentDashboardFixture = {
  ...studentDashboardFixtureEmptyFr,
  dateLabel: "June 17, 2026",
};
