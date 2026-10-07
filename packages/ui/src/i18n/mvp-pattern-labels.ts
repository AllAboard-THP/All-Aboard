export type MvpPatternLabels = {
  emptyState: {
    feedTitle: string;
    feedDescription: string;
    feedCta: string;
    responsesTitle: string;
    responsesDescription: string;
    notFoundTitle: string;
    notFoundDescriptionBefore: string;
    notFoundDescriptionAfter: string;
    notFoundId: string;
    backToFeed: string;
    mentorFeedTitle: string;
    mentorFeedDescription: string;
    catalogDescription: string;
  };
  formField: {
    userIdLabel: string;
    passwordLabel: string;
    passwordMvpLabel: string;
    titleLabel: string;
    titlePlaceholder: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    submitButton: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    invalidCredentials: string;
    duplicateTitle: string;
    duplicateLink: string;
    rubberduckTitle: string;
    rubberduckDescription: string;
    userIdLabelShort: string;
    titleLabelShort: string;
  };
  pageHeader: {
    feedEyebrow: string;
    feedTitle: string;
    feedDescription: string;
    feedCta: string;
    mentorEyebrow: string;
    mentorTitle: string;
    mentorDescription: string;
    detailEyebrow: string;
    detailTitle: string;
    detailMeta: string;
    catalogDescription: string;
  };
  loadingFeed: {
    feedAriaLabel: string;
    requestAriaLabel: string;
  };
  toast: {
    success: string;
    error: string;
    info: string;
    warning: string;
    successShort: string;
    errorShort: string;
    warningShort: string;
    infoShort: string;
    successButton: string;
    errorButton: string;
    infoButton: string;
    catalogMessage: string;
    catalogButton: string;
    catalogNotification: string;
    publishedSuccess: string;
    publishError: string;
    mentorSession: string;
  };
  catalog: {
    listingTitle: string;
    listingLead: string;
    listingStrong: string;
    listingTail: string;
    cardTitle: string;
    cardDescription: string;
    cardContent: string;
    textField: string;
    invalidState: string;
    multiline: string;
    fieldLabel: string;
    associatedInput: string;
    above: string;
    below: string;
    newRequest: string;
    back: string;
    sending: string;
    tagsOptional: string;
    passwordMvp: string;
    titleDescription: string;
    selectHelp: string;
    selectMentor: string;
    feedCardTitle: string;
    feedCardDescription: string;
    patternsListingTitle: string;
    patternsListingLead: string;
    patternsListingStrong: string;
    patternsListingTail: string;
    detailPrefix: string;
    feedItemTitle: string;
    feedItemAuthor: string;
  };
};

export const mvpPatternLabelsFr: MvpPatternLabels = {
  emptyState: {
    feedTitle: "Aucune demande pour l'instant",
    feedDescription: "Soyez le premier à publier une demande d'aide.",
    feedCta: "Publier une demande",
    responsesTitle: "Aucune réponse pour l'instant",
    responsesDescription:
      "Les mentors pourront répondre lorsque la demande sera visible.",
    notFoundTitle: "Demande introuvable",
    notFoundDescriptionBefore: "Aucune demande ne correspond à l'identifiant ",
    notFoundDescriptionAfter: "",
    notFoundId: "req-unknown",
    backToFeed: "Retour au feed",
    mentorFeedTitle: "Aucune demande taguée",
    mentorFeedDescription:
      "Les demandes avec des tags mentor ou domaine apparaîtront ici.",
    catalogDescription: "Soyez le premier à publier.",
  },
  formField: {
    userIdLabel: "Identifiant utilisateur",
    passwordLabel: "Mot de passe",
    passwordMvpLabel: "Mot de passe MVP",
    titleLabel: "Titre de la demande",
    titlePlaceholder: "Décrivez votre problème en une ou plusieurs phrases",
    tagsLabel: "Tags (optionnel)",
    tagsPlaceholder: "mentor, rails",
    submitButton: "Connexion et publier",
    descriptionLabel: "Description détaillée",
    descriptionPlaceholder: "Contexte, étapes déjà tentées…",
    invalidCredentials: "Identifiants invalides.",
    duplicateTitle: "Doublon détecté (MOC)",
    duplicateLink: "Voir la demande existante",
    rubberduckTitle: "Rubberduck (stub)",
    rubberduckDescription:
      "Titre court — piste IA possible (Phase 4). Publiez une nouvelle demande ou consultez le feed.",
    userIdLabelShort: "Identifiant",
    titleLabelShort: "Titre",
  },
  pageHeader: {
    feedEyebrow: "All-Aoard",
    feedTitle: "Feed communautaire",
    feedDescription:
      "Parcourez les demandes d'aide publiées par la communauté.",
    feedCta: "Nouvelle demande",
    mentorEyebrow: "Mentor",
    mentorTitle: "Demandes à traiter",
    mentorDescription:
      "Connecté en tant que alice — demandes taguées mentor/domaine.",
    detailEyebrow: "Demande d'aide",
    detailTitle: "Comment structurer un monorepo Turborepo ?",
    detailMeta: "Auteur : bob · 26 mai 2026, 14:30",
    catalogDescription: "Description de page.",
  },
  loadingFeed: {
    feedAriaLabel: "Chargement du feed",
    requestAriaLabel: "Chargement de la demande",
  },
  toast: {
    success: "Demande publiée avec succès",
    error: "Impossible de publier la demande",
    info: "Session mentor active",
    warning: "Attention",
    successShort: "Succès",
    errorShort: "Erreur",
    warningShort: "Warning",
    infoShort: "Info",
    successButton: "Toast succès",
    errorButton: "Toast erreur",
    infoButton: "Toast info",
    catalogMessage: "Toast catalogue",
    catalogButton: "Afficher un toast",
    catalogNotification: "Notification catalogue",
    publishedSuccess: "Demande publiée avec succès",
    publishError: "Impossible de publier la demande",
    mentorSession: "Session mentor active",
  },
  catalog: {
    listingTitle: "Catalogue primitives",
    listingLead: "Onze composants MVP. Utilise la sidebar",
    listingStrong: "Documentation → Catalog → 01…11",
    listingTail: "pour les voir un par un, ou fais défiler cette page.",
    cardTitle: "Titre carte",
    cardDescription: "Sous-titre ou métadonnées.",
    cardContent: "Contenu principal.",
    textField: "Champ texte",
    invalidState: "État invalide",
    multiline: "Texte multiligne",
    fieldLabel: "Libellé de champ",
    associatedInput: "Associé à un input",
    above: "Au-dessus",
    below: "En-dessous",
    newRequest: "Nouvelle demande",
    back: "Retour",
    sending: "Envoi…",
    tagsOptional: "Tags (optionnel)",
    passwordMvp: "Mot de passe MVP",
    titleDescription: "Titre / description de la demande",
    selectHelp: "Aide",
    selectMentor: "Mentor",
    feedCardTitle: "Titre feed",
    feedCardDescription: "Auteur : bob · 26 mai 2026",
    patternsListingTitle: "Catalogue patterns",
    patternsListingLead: "Six compositions alignées sur",
    patternsListingStrong: "apps/web",
    patternsListingTail:
      ". Entrées 01…06 dans la sidebar.",
    detailPrefix: "Détail :",
    feedItemTitle: "Comment structurer un monorepo ?",
    feedItemAuthor: "Auteur : bob",
  },
};

export const mvpPatternLabelsEn: MvpPatternLabels = {
  emptyState: {
    feedTitle: "No requests yet",
    feedDescription: "Be the first to publish a help request.",
    feedCta: "Publish a request",
    responsesTitle: "No responses yet",
    responsesDescription:
      "Mentors can reply once the request is visible.",
    notFoundTitle: "Request not found",
    notFoundDescriptionBefore: "No request matches identifier ",
    notFoundDescriptionAfter: "",
    notFoundId: "req-unknown",
    backToFeed: "Back to feed",
    mentorFeedTitle: "No tagged requests",
    mentorFeedDescription:
      "Requests with mentor or domain tags will appear here.",
    catalogDescription: "Be the first to publish.",
  },
  formField: {
    userIdLabel: "User identifier",
    passwordLabel: "Password",
    passwordMvpLabel: "MVP password",
    titleLabel: "Request title",
    titlePlaceholder: "Describe your issue in one or more sentences",
    tagsLabel: "Tags (optional)",
    tagsPlaceholder: "mentor, rails",
    submitButton: "Sign in and publish",
    descriptionLabel: "Detailed description",
    descriptionPlaceholder: "Context, steps already tried…",
    invalidCredentials: "Invalid credentials.",
    duplicateTitle: "Duplicate detected (MOC)",
    duplicateLink: "View existing request",
    rubberduckTitle: "Rubberduck (stub)",
    rubberduckDescription:
      "Short title — AI hint possible (Phase 4). Publish a new request or browse the feed.",
    userIdLabelShort: "Identifier",
    titleLabelShort: "Title",
  },
  pageHeader: {
    feedEyebrow: "All-Aboard",
    feedTitle: "Community feed",
    feedDescription: "Browse help requests published by the community.",
    feedCta: "New request",
    mentorEyebrow: "Mentor",
    mentorTitle: "Requests to handle",
    mentorDescription:
      "Signed in as alice — requests tagged mentor/domain.",
    detailEyebrow: "Help request",
    detailTitle: "How to structure a Turborepo monorepo?",
    detailMeta: "Author: bob · May 26, 2026, 2:30 PM",
    catalogDescription: "Page description.",
  },
  loadingFeed: {
    feedAriaLabel: "Loading feed",
    requestAriaLabel: "Loading request",
  },
  toast: {
    success: "Request published successfully",
    error: "Unable to publish the request",
    info: "Mentor session active",
    warning: "Warning",
    successShort: "Success",
    errorShort: "Error",
    warningShort: "Warning",
    infoShort: "Info",
    successButton: "Success toast",
    errorButton: "Error toast",
    infoButton: "Info toast",
    catalogMessage: "Catalog toast",
    catalogButton: "Show toast",
    catalogNotification: "Catalog notification",
    publishedSuccess: "Request published successfully",
    publishError: "Unable to publish the request",
    mentorSession: "Mentor session active",
  },
  catalog: {
    listingTitle: "Primitive catalog",
    listingLead: "Eleven MVP components. Use the sidebar",
    listingStrong: "Documentation → Catalog → 01…11",
    listingTail: "to view them one by one, or scroll this page.",
    cardTitle: "Card title",
    cardDescription: "Subtitle or metadata.",
    cardContent: "Main content.",
    textField: "Text field",
    invalidState: "Invalid state",
    multiline: "Multiline text",
    fieldLabel: "Field label",
    associatedInput: "Linked to an input",
    above: "Above",
    below: "Below",
    newRequest: "New request",
    back: "Back",
    sending: "Sending…",
    tagsOptional: "Tags (optional)",
    passwordMvp: "MVP password",
    titleDescription: "Request title / description",
    selectHelp: "Help",
    selectMentor: "Mentor",
    feedCardTitle: "Feed title",
    feedCardDescription: "Author: bob · May 26, 2026",
    patternsListingTitle: "Pattern catalog",
    patternsListingLead: "Six compositions aligned with",
    patternsListingStrong: "apps/web",
    patternsListingTail: ". Entries 01…06 in the sidebar.",
    detailPrefix: "Detail:",
    feedItemTitle: "How to structure a monorepo?",
    feedItemAuthor: "Author: bob",
  },
};
