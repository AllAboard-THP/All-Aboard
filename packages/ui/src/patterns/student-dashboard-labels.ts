export type StudentDashboardLabels = {
  brandName: string;
  chrome: {
    footerRights: (year: number) => string;
    footerCgu: string;
    footerPrivacy: string;
    footerLegal: string;
  };
  sidebar: {
    navigationGroup: string;
    communityGroup: string;
    mentorGroup: string;
    adminGroup: string;
    expandSidebar: string;
    collapseSidebar: string;
    openMenu: string;
    closeMenu: string;
    dashboard: string;
    subjects: string;
    resources: string;
    newRequest: string;
    feed: string;
    messages: string;
    mentor: string;
    profile: string;
    adminOverview: string;
    adminUsers: string;
    adminModeration: string;
    settings: string;
    signOut: string;
    context: {
      dashboard: {
        title: string;
        description: string;
        newRequest: string;
        browseFeed: string;
        inbox: string;
        myRequests: string;
      };
      subjects: { title: string; explore: string };
      resources: { title: string; all: string };
      newRequest: { title: string; description: string; create: string; backToFeed: string };
      feed: {
        title: string;
        description: string;
        browse: string;
        newRequest: string;
        backToFeed: string;
      };
      messages: { title: string; inbox: string };
      mentor: { title: string; space: string; demo: string };
      profile: { title: string; view: string };
      admin: {
        title: string;
        description: string;
        overview: string;
        users: string;
        moderation: string;
      };
    };
  };
  header: {
    greetingPrefix: string;
    greetingSuffix: string;
    subtitle: string;
    primaryCta: string;
  };
  inbox: {
    title: string;
    empty: string;
    emptyCta: string;
    overflow: (count: number) => string;
  };
  activity: {
    title: string;
    viewAll: string;
    empty: string;
    kinds: {
      reply: string;
      resource: string;
    };
  };
  shortcuts: {
    subjects: string;
    resources: string;
    profile: string;
  };
};

export const studentDashboardLabelsFr: StudentDashboardLabels = {
  brandName: "All-Aboard",
  chrome: {
    footerRights: (year) => `© ${year} All-Aboard — Tous droits réservés`,
    footerCgu: "CGU",
    footerPrivacy: "Confidentialité",
    footerLegal: "Mentions légales",
  },
  sidebar: {
    navigationGroup: "Navigation",
    communityGroup: "Communauté",
    mentorGroup: "Mentorat",
    adminGroup: "Administration",
    expandSidebar: "Déplier la barre latérale",
    collapseSidebar: "Replier la barre latérale",
    openMenu: "Menu de navigation",
    closeMenu: "Fermer le menu",
    dashboard: "Mon dashboard",
    subjects: "Matières",
    resources: "Ressources",
    newRequest: "Nouvelle demande",
    feed: "Entraide",
    messages: "Messages",
    mentor: "Espace mentor",
    profile: "Mon profil",
    adminOverview: "Vue d'ensemble",
    adminUsers: "Utilisateurs",
    adminModeration: "Modération",
    settings: "Paramètres",
    signOut: "Déconnexion",
    context: {
      dashboard: {
        title: "Sur cette page",
        description: "Raccourcis vers tes actions courantes.",
        newRequest: "Nouvelle demande",
        browseFeed: "Parcourir le fil",
        inbox: "Messages non lus",
        myRequests: "Mes demandes en cours",
      },
      subjects: { title: "Matières", explore: "Explorer les matières" },
      resources: { title: "Ressources", all: "Toutes les ressources" },
      newRequest: {
        title: "Nouvelle demande",
        description: "Publie une question pour l'entraide.",
        create: "Créer une demande",
        backToFeed: "Retour au fil",
      },
      feed: {
        title: "Entraide",
        description: "Publie une demande ou retrouve le fil.",
        browse: "Parcourir le fil",
        newRequest: "Nouvelle demande",
        backToFeed: "Retour au fil",
      },
      messages: { title: "Messages", inbox: "Boîte de réception" },
      mentor: {
        title: "Mentorat",
        space: "Espace mentor",
        demo: "Dashboard mentor démo",
      },
      profile: { title: "Profil", view: "Voir mon profil" },
      admin: {
        title: "Administration",
        description: "Modération et gestion des comptes.",
        overview: "Vue d'ensemble",
        users: "Utilisateurs",
        moderation: "Modération",
      },
    },
  },
  header: {
    greetingPrefix: "Bonjour",
    greetingSuffix: " !",
    subtitle: "Reprends là où tu t'es arrêtée.",
    primaryCta: "Nouvelle demande",
  },
  inbox: {
    title: "À faire",
    empty: "Tout est à jour.",
    emptyCta: "Parcourir l'entraide",
    overflow: (count) => `+${count} autres`,
  },
  activity: {
    title: "Activité récente",
    viewAll: "Voir tout le fil",
    empty: "Aucune activité récente.",
    kinds: {
      reply: "Réponse",
      resource: "Ressource",
    },
  },
  shortcuts: {
    subjects: "Explorer",
    resources: "Ressources",
    profile: "Mon profil",
  },
};

export const studentDashboardLabelsEn: StudentDashboardLabels = {
  brandName: "All-Aboard",
  chrome: {
    footerRights: (year) => `© ${year} All-Aboard — All rights reserved`,
    footerCgu: "Terms",
    footerPrivacy: "Privacy",
    footerLegal: "Legal notice",
  },
  sidebar: {
    navigationGroup: "Navigation",
    communityGroup: "Community",
    mentorGroup: "Mentoring",
    adminGroup: "Administration",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    openMenu: "Navigation menu",
    closeMenu: "Close menu",
    dashboard: "My dashboard",
    subjects: "Subjects",
    resources: "Resources",
    newRequest: "New request",
    feed: "Peer help",
    messages: "Messages",
    mentor: "Mentor space",
    profile: "My profile",
    adminOverview: "Overview",
    adminUsers: "Users",
    adminModeration: "Moderation",
    settings: "Settings",
    signOut: "Sign out",
    context: {
      dashboard: {
        title: "On this page",
        description: "Shortcuts to your frequent actions.",
        newRequest: "New request",
        browseFeed: "Browse feed",
        inbox: "Unread messages",
        myRequests: "My open requests",
      },
      subjects: { title: "Subjects", explore: "Explore subjects" },
      resources: { title: "Resources", all: "All resources" },
      newRequest: {
        title: "New request",
        description: "Post a question for peer help.",
        create: "Create a request",
        backToFeed: "Back to feed",
      },
      feed: {
        title: "Peer help",
        description: "Post a request or browse the feed.",
        browse: "Browse feed",
        newRequest: "New request",
        backToFeed: "Back to feed",
      },
      messages: { title: "Messages", inbox: "Inbox" },
      mentor: {
        title: "Mentoring",
        space: "Mentor space",
        demo: "Mentor demo dashboard",
      },
      profile: { title: "Profile", view: "View my profile" },
      admin: {
        title: "Administration",
        description: "Moderation and account management.",
        overview: "Overview",
        users: "Users",
        moderation: "Moderation",
      },
    },
  },
  header: {
    greetingPrefix: "Hello",
    greetingSuffix: "!",
    subtitle: "Pick up where you left off.",
    primaryCta: "New request",
  },
  inbox: {
    title: "To do",
    empty: "You're all caught up.",
    emptyCta: "Browse peer help",
    overflow: (count) => `+${count} more`,
  },
  activity: {
    title: "Recent activity",
    viewAll: "View full feed",
    empty: "No recent activity.",
    kinds: {
      reply: "Reply",
      resource: "Resource",
    },
  },
  shortcuts: {
    subjects: "Explore",
    resources: "Resources",
    profile: "My profile",
  },
};
