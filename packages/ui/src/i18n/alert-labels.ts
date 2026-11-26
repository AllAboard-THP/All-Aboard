export type AlertLabels = {
  information: string;
  neutralMessage: string;
  neutralMessageShort: string;
  neutralMessageCatalog: string;
  loginRequired: string;
  loginRequiredLink: string;
  loginRequiredBodyBefore: string;
  loginRequiredBodyAfter: string;
  feedLoadError: string;
  feedLoadErrorCatalog: string;
  requestLoadError: string;
  mentorForbidden: string;
  mentorForbiddenDescription: string;
  error: string;
  http502: string;
  notFound: string;
};

export const alertLabelsFr: AlertLabels = {
  information: "Information",
  neutralMessage: "Message informatif pour l'utilisateur.",
  neutralMessageShort: "Message informatif neutre.",
  neutralMessageCatalog: "Message informatif.",
  loginRequired: "Connexion requise",
  loginRequiredLink: "Nouvelle demande",
  loginRequiredBodyBefore: "Connectez-vous via",
  loginRequiredBodyAfter: "pour accéder au dashboard mentor.",
  feedLoadError: "Impossible de charger le feed",
  feedLoadErrorCatalog: "Impossible de charger le feed.",
  requestLoadError: "Impossible de charger la demande",
  mentorForbidden: "Accès réservé aux mentors",
  mentorForbiddenDescription:
    "Ce tableau de bord est réservé aux comptes mentor (MVP).",
  error: "Erreur",
  http502: "Feed HTTP 502",
  notFound: "not_found",
};

export const alertLabelsEn: AlertLabels = {
  information: "Information",
  neutralMessage: "Neutral informational message for the user.",
  neutralMessageShort: "Neutral informational message.",
  neutralMessageCatalog: "Informational message.",
  loginRequired: "Sign-in required",
  loginRequiredLink: "New request",
  loginRequiredBodyBefore: "Sign in via",
  loginRequiredBodyAfter: "to access the mentor dashboard.",
  feedLoadError: "Unable to load the feed",
  feedLoadErrorCatalog: "Unable to load the feed.",
  requestLoadError: "Unable to load the request",
  mentorForbidden: "Mentors only",
  mentorForbiddenDescription:
    "This dashboard is reserved for mentor accounts (MVP).",
  error: "Error",
  http502: "Feed HTTP 502",
  notFound: "not_found",
};
