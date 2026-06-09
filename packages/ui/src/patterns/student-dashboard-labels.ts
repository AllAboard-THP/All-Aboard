export type StudentDashboardLabels = {
  brandName: string;
  chrome: {
    demoBadge: string;
    footerRights: (year: number) => string;
    footerCgu: string;
    footerPrivacy: string;
    footerLegal: string;
  };
  sidebar: {
    navigationGroup: string;
    communityGroup: string;
    dashboard: string;
    subjects: string;
    resources: string;
    events: string;
    feed: string;
    messages: string;
    mentor: string;
    profile: string;
    settings: string;
    signOut: string;
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
    demoBadge: "Dashboard étudiant · Démo",
    footerRights: (year) => `© ${year} All-Aboard — Tous droits réservés`,
    footerCgu: "CGU",
    footerPrivacy: "Confidentialité",
    footerLegal: "Mentions légales",
  },
  sidebar: {
    navigationGroup: "Navigation",
    communityGroup: "Communauté",
    dashboard: "Mon dashboard",
    subjects: "Matières",
    resources: "Ressources",
    events: "Événements",
    feed: "Entraide",
    messages: "Messages",
    mentor: "Espace mentor",
    profile: "Mon profil",
    settings: "Paramètres",
    signOut: "Déconnexion",
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
    demoBadge: "Student dashboard · Demo",
    footerRights: (year) => `© ${year} All-Aboard — All rights reserved`,
    footerCgu: "Terms",
    footerPrivacy: "Privacy",
    footerLegal: "Legal notice",
  },
  sidebar: {
    navigationGroup: "Navigation",
    communityGroup: "Community",
    dashboard: "My dashboard",
    subjects: "Subjects",
    resources: "Resources",
    events: "Events",
    feed: "Peer help",
    messages: "Messages",
    mentor: "Mentor space",
    profile: "My profile",
    settings: "Settings",
    signOut: "Sign out",
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
