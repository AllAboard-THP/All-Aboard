import type { LegacyLabels } from "../i18n/legacy-labels";

export type MentorDashboardMentorLabels = LegacyLabels["mentor"];

export type MentorDashboardLabels = {
  brandName: string;
  chrome: {
    footerRights: (year: number) => string;
    footerCgu: string;
    footerPrivacy: string;
    footerLegal: string;
  };
  header: {
    greetingPrefix: string;
    greetingSuffix: string;
    subtitle: string;
    statPublished: string;
    statPending: string;
    statHelp: string;
  };
  mentor: MentorDashboardMentorLabels;
  panels: {
    demoToast: string;
  };
};

export const mentorDashboardLabelsFr: MentorDashboardLabels = {
  brandName: "All-Aboard",
  chrome: {
    footerRights: (year) => `© ${year} All-Aboard — Tous droits réservés`,
    footerCgu: "CGU",
    footerPrivacy: "Confidentialité",
    footerLegal: "Mentions légales",
  },
  header: {
    greetingPrefix: "Bonjour",
    greetingSuffix: " !",
    subtitle:
      "Valide les ressources soumises et réponds aux demandes d'aide dans tes domaines.",
    statPublished: "Ressources publiées",
    statPending: "Ressources à valider",
    statHelp: "Demandes d'aide",
  },
  mentor: {
    title: "Mon espace Mentor",
    subtitle:
      "Validez les ressources soumises par la communauté dans vos domaines de compétence.",
    statsPublished: "Ressources publiées",
    statsPending: "Ressources à valider",
    statsHelp: "Demandes d'aide",
    actionRequired: "Action requise",
    helpPanelTitle: "Demandes d'aide",
    helpEmpty: "Aucune demande d'aide pour le moment.",
    helpCta: "Aider",
    validationPanelTitle: "Ressources à valider",
    approve: "Approuver",
    reject: "Refuser",
    validationEmpty:
      "Aucune ressource en attente dans tes domaines de compétence.",
    submittedPrefix: "Soumise",
  },
  panels: {
    demoToast: "Démo — fonctionnalité à venir",
  },
};

export const mentorDashboardLabelsEn: MentorDashboardLabels = {
  brandName: "All-Aboard",
  chrome: {
    footerRights: (year) => `© ${year} All-Aboard — All rights reserved`,
    footerCgu: "Terms",
    footerPrivacy: "Privacy",
    footerLegal: "Legal notice",
  },
  header: {
    greetingPrefix: "Hello",
    greetingSuffix: "!",
    subtitle:
      "Review submitted resources and respond to help requests in your areas.",
    statPublished: "Published resources",
    statPending: "Resources to review",
    statHelp: "Help requests",
  },
  mentor: {
    title: "My Mentor space",
    subtitle:
      "Review resources submitted by the community in your areas of expertise.",
    statsPublished: "Published resources",
    statsPending: "Resources to review",
    statsHelp: "Help requests",
    actionRequired: "Action required",
    helpPanelTitle: "Help requests",
    helpEmpty: "No help requests at the moment.",
    helpCta: "Help",
    validationPanelTitle: "Resources to review",
    approve: "Approve",
    reject: "Reject",
    validationEmpty: "No pending resources in your areas of expertise.",
    submittedPrefix: "Submitted",
  },
  panels: {
    demoToast: "Demo — feature coming soon",
  },
};
