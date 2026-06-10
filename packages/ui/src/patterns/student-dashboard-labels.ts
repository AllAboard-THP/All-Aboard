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
    events: string;
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
      dashboard: { title: string; description: string; demo: string };
      subjects: { title: string; explore: string };
      resources: { title: string; all: string };
      events: { title: string; all: string };
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
    statPosts: string;
    statReplies: string;
    statRating: string;
  };
  panels: {
    helpRequestsTitle: string;
    helpRequestsEmpty: string;
    helpRequestsCta: string;
    upcomingTitle: string;
    resourcesTitle: string;
    resourcesEmpty: string;
    resourcesCta: string;
    subjectsTitle: string;
    subjectsEmpty: string;
    subjectsCta: string;
    unansweredTitle: string;
    unansweredEmpty: string;
    demoToast: string;
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
    events: "Événements",
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
        title: "Ton espace",
        description: "Suivi de progression et demandes en cours.",
        demo: "Dashboard démo",
      },
      subjects: { title: "Matières", explore: "Explorer les matières" },
      resources: { title: "Ressources", all: "Toutes les ressources" },
      events: { title: "Événements", all: "Agenda complet" },
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
    greetingSuffix: "!",
    subtitle: "Explore les matières disponibles et continue ta progression.",
    statPosts: "Posts publiés",
    statReplies: "Réponses données",
    statRating: "Note communauté",
  },
  panels: {
    helpRequestsTitle: "Demandes du moment",
    helpRequestsEmpty: "Aucune demande disponible pour le moment",
    helpRequestsCta: "Voir l'entraide",
    upcomingTitle: "À venir sur ton dashboard",
    resourcesTitle: "Nouvelles ressources",
    resourcesEmpty: "Aucune nouveauté pour le moment",
    resourcesCta: "Toutes les ressources",
    subjectsTitle: "Matières suivies",
    subjectsEmpty: "Aucune matière en cours",
    subjectsCta: "Explorer les matières",
    unansweredTitle: "Demandes sans réponse",
    unansweredEmpty: "Toutes tes demandes ont reçu une réponse",
    demoToast: "Démo — fonctionnalité à venir",
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
    events: "Events",
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
        title: "Your space",
        description: "Track progress and open requests.",
        demo: "Demo dashboard",
      },
      subjects: { title: "Subjects", explore: "Explore subjects" },
      resources: { title: "Resources", all: "All resources" },
      events: { title: "Events", all: "Full calendar" },
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
    subtitle: "Explore available subjects and keep progressing.",
    statPosts: "Published posts",
    statReplies: "Replies given",
    statRating: "Community rating",
  },
  panels: {
    helpRequestsTitle: "Current requests",
    helpRequestsEmpty: "No requests available right now",
    helpRequestsCta: "Browse peer help",
    upcomingTitle: "Coming to your dashboard",
    resourcesTitle: "New resources",
    resourcesEmpty: "No updates right now",
    resourcesCta: "All resources",
    subjectsTitle: "Subjects in progress",
    subjectsEmpty: "No subjects in progress",
    subjectsCta: "Explore subjects",
    unansweredTitle: "Unanswered requests",
    unansweredEmpty: "All your requests have received a reply",
    demoToast: "Demo — feature coming soon",
  },
};
