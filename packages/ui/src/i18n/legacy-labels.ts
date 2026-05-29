export type LegacyNavLink = "feed" | "explore" | "resources" | "events" | "messages";

export type LegacyLabels = {
  brandName: string;
  nav: Record<LegacyNavLink, string>;
  userMenu: {
    profile: string;
    myPosts: string;
    bookmarks: string;
    mentorSpace: string;
    adminDashboard: string;
    signOut: string;
  };
  footer: {
    rights: (year: number) => string;
    cgu: string;
    privacy: string;
    legal: string;
  };
  landing: {
    eyebrow: string;
    headingLead: string;
    headingAccent: string;
    description: string;
    pills: [string, string, string];
  };
  subjectCard: {
    requests: (count: number) => string;
    proposeTitle: string;
    proposeDescription: string;
    proposeAction: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    password: string;
    rememberMe: string;
    submit: string;
    noAccount: string;
    signUp: string;
    registerEyebrow: string;
    registerHeading: string;
    registerDescription: string;
    registerTitle: string;
    registerSubtitle: string;
    fullName: string;
    educationLevel: string;
    educationLevelPlaceholder: string;
    headline: string;
    headlinePlaceholder: string;
    passwordConfirmation: string;
    passwordHint: string;
    registerSubmit: string;
    hasAccount: string;
    signIn: string;
    forgotTitle: string;
    forgotSubtitle: string;
    forgotSubmit: string;
  };
  explore: {
    title: string;
    subtitle: string;
  };
  resources: {
    title: string;
    subtitle: string;
    publishCta: string;
    searchPlaceholder: string;
    searchButton: string;
  };
  feed: {
    recentTitle: string;
    recentEmpty: string;
    unansweredTitle: string;
    unansweredEmpty: string;
    searchTitle: string;
    searchPlaceholder: string;
    contributionsTitle: string;
    contributionsEmpty: string;
    quickReplyPlaceholder: string;
    quickReplySubmit: string;
    scrollTop: string;
  };
  events: {
    title: string;
    subtitle: string;
    upcomingTitle: string;
    filterAll: string;
    filterGeneral: string;
    registerCta: string;
    onlineBadge: string;
  };
  messages: {
    title: string;
    searchPlaceholder: string;
    emptySelection: string;
    startConversation: string;
  };
  profile: {
    aboutTitle: string;
    levelPrefix: string;
    sendMessage: string;
    statsPosts: string;
    statsReplies: string;
    statsRating: string;
    tabPosts: string;
    tabReplies: string;
    postsEmpty: string;
    repliesEmpty: string;
    replyOnPrefix: string;
    publishedPrefix: string;
  };
  admin: {
    title: string;
    subtitle: string;
    stats: {
      posts: string;
      users: string;
      subjectRequests: string;
      pendingResources: string;
      moderation: string;
    };
    actionsTitle: string;
    actions: {
      managePosts: string;
      viewUsers: string;
      sendMessage: string;
      subjectRequests: string;
      createAdmin: string;
      validateResources: string;
      events: string;
      moderation: string;
    };
  };
  mobileNav: {
    home: string;
    explore: string;
    messages: string;
    profile: string;
    createAria: string;
  };
  modals: {
    createPost: {
      title: string;
      requestTitle: string;
      subject: string;
      subjectPlaceholder: string;
      body: string;
      bodyPlaceholder: string;
      submit: string;
    };
    subjectRequest: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      whyLabel: string;
      whyPlaceholder: string;
      info: string;
      cancel: string;
      submit: string;
    };
    cgu: {
      welcome: string;
      subtitle: string;
      body: string;
      checkbox: string;
      submit: string;
    };
  };
  legal: {
    updatedPrefix: string;
    back: string;
    privacyLink: string;
    legalLink: string;
  };
  mentor: {
    title: string;
    subtitle: string;
    statsPublished: string;
    statsPending: string;
    statsHelp: string;
    actionRequired: string;
    helpPanelTitle: string;
    helpEmpty: string;
    helpCta: string;
    validationPanelTitle: string;
    approve: string;
    reject: string;
    validationEmpty: string;
    submittedPrefix: string;
  };
  moderation: {
    title: string;
    subtitle: (count: number) => string;
    denylist: string;
    postsTitle: string;
    commentsTitle: string;
    pendingBadge: string;
    replyToPrefix: string;
    approve: string;
    reject: string;
    postsEmpty: string;
    commentsEmpty: string;
  };
  adminUsers: {
    title: string;
    total: (count: number) => string;
    createAdmin: string;
    back: string;
    columns: {
      name: string;
      email: string;
      posts: string;
      comments: string;
      role: string;
      createdAt: string;
      actions: string;
    };
    roleAdmin: string;
    roleStudent: string;
    mentorBadge: string;
    demoteAdmin: string;
    promoteAdmin: string;
    removeMentor: string;
    promoteMentor: string;
  };
};

export const legacyLabelsFr: LegacyLabels = {
  brandName: "AllAboard",
  nav: {
    feed: "Accueil",
    explore: "Matières",
    resources: "Ressources",
    events: "Événements",
    messages: "Messages",
  },
  userMenu: {
    profile: "Mon profil",
    myPosts: "Mes posts",
    bookmarks: "Mes sauvegardes",
    mentorSpace: "Espace Mentor",
    adminDashboard: "Tableau de bord Admin",
    signOut: "Déconnexion",
  },
  footer: {
    rights: (year) => `© ${year} — Tous droits réservés`,
    cgu: "CGU",
    privacy: "Confidentialité",
    legal: "Mentions légales",
  },
  landing: {
    eyebrow: "Entraide étudiante en temps réel",
    headingLead: "L'espace où les étudiants",
    headingAccent: "s'aident vraiment",
    description:
      "Publiez une requête, recevez des réponses ciblées, obtenez de l'aide de professionnels confirmés, échangez vos savoirs !",
    pills: ["Feed social ciblé", "Chat temps réel", "Exploration par matière"],
  },
  subjectCard: {
    requests: (count) =>
      `${count.toLocaleString("fr-FR")} requêtes`,
    proposeTitle: "Proposer une matière",
    proposeDescription:
      "Vous ne trouvez pas votre matière ? Demandez son ajout !",
    proposeAction: "Faire une demande",
  },
  auth: {
    loginTitle: "Connexion",
    loginSubtitle: "Rentre dans ton compte AllAboard",
    email: "Email",
    password: "Mot de passe",
    rememberMe: "Se souvenir de moi",
    submit: "Se connecter",
    noAccount: "Pas encore de compte ?",
    signUp: "Inscris-toi",
    registerEyebrow: "Création de compte",
    registerHeading: "Entre dans une communauté qui résout vraiment.",
    registerDescription:
      "Inscris-toi pour publier des requêtes, aider d'autres étudiants et basculer en messagerie instantanée.",
    registerTitle: "Créer un compte",
    registerSubtitle: "Quelques infos et ton espace est prêt.",
    fullName: "Nom complet",
    educationLevel: "Niveau",
    educationLevelPlaceholder: "Ex: Licence Informatique",
    headline: "Headline",
    headlinePlaceholder: "Ex: Étudiant full-stack et passionné de maths",
    passwordConfirmation: "Confirmation",
    passwordHint: "1 majuscule, 1 chiffre, 1 caractère spécial",
    registerSubmit: "Créer mon compte",
    hasAccount: "Déjà un compte ?",
    signIn: "Connecte-toi",
    forgotTitle: "Mot de passe oublié ?",
    forgotSubtitle:
      "Entrez votre email pour recevoir les instructions de réinitialisation.",
    forgotSubmit: "Envoyer les instructions",
  },
  explore: {
    title: "Explorer",
    subtitle: "Découvrez les requêtes par matière",
  },
  resources: {
    title: "Ressources",
    subtitle:
      "Guides et ressources pédagogiques partagés par la communauté AllAboard.",
    publishCta: "Publier une ressource",
    searchPlaceholder:
      "Rechercher par titre, contenu, matière ou sous-tag…",
    searchButton: "Rechercher",
  },
  feed: {
    recentTitle: "Consultés récemment",
    recentEmpty: "Les posts que vous consultez apparaîtront ici.",
    unansweredTitle: "Sans réponse",
    unansweredEmpty: "Tous les posts ont au moins une réponse !",
    searchTitle: "Rechercher",
    searchPlaceholder: "Titre, contenu, tag…",
    contributionsTitle: "Dernières contributions",
    contributionsEmpty: "Tes réponses apparaîtront ici.",
    quickReplyPlaceholder: "Écrire une réponse rapide…",
    quickReplySubmit: "Répondre",
    scrollTop: "Remonter en haut",
  },
  events: {
    title: "Événements",
    subtitle:
      "Hackathons, portes ouvertes, conférences et forums sélectionnés pour vous.",
    upcomingTitle: "À venir",
    filterAll: "Tous",
    filterGeneral: "Général",
    registerCta: "S'inscrire",
    onlineBadge: "En ligne",
  },
  messages: {
    title: "Messages",
    searchPlaceholder: "Rechercher…",
    emptySelection: "Sélectionnez une conversation",
    startConversation: "Commencez la conversation",
  },
  profile: {
    aboutTitle: "À propos",
    levelPrefix: "Niveau :",
    sendMessage: "Envoyer un message",
    statsPosts: "Requêtes publiées",
    statsReplies: "Réponses données",
    statsRating: "Note moyenne",
    tabPosts: "Requêtes",
    tabReplies: "Réponses",
    postsEmpty: "Ce membre n'a pas encore publié de requêtes.",
    repliesEmpty: "Ce membre n'a encore pas répondu à des requêtes.",
    replyOnPrefix: "Sur :",
    publishedPrefix: "publiée",
  },
  admin: {
    title: "Tableau de bord Admin",
    subtitle: "Gérez l'application et les utilisateurs",
    stats: {
      posts: "Posts publiés",
      users: "Utilisateurs",
      subjectRequests: "Demandes matières",
      pendingResources: "Ressources en attente",
      moderation: "En attente de modération",
    },
    actionsTitle: "Actions",
    actions: {
      managePosts: "Gérer les posts",
      viewUsers: "Voir les utilisateurs",
      sendMessage: "Envoyer un message",
      subjectRequests: "Demandes de matières",
      createAdmin: "Créer un administrateur",
      validateResources: "Ressources à valider",
      events: "Événements",
      moderation: "Modération",
    },
  },
  mobileNav: {
    home: "Accueil",
    explore: "Explorer",
    messages: "Messages",
    profile: "Profil",
    createAria: "Nouvelle requête",
  },
  modals: {
    createPost: {
      title: "Nouvelle requête",
      requestTitle: "Titre de la requête",
      subject: "Matière",
      subjectPlaceholder: "Choisir une matière…",
      body: "Description",
      bodyPlaceholder: "Décrivez votre problème ou votre question…",
      submit: "Publier la requête",
    },
    subjectRequest: {
      title: "Proposer une nouvelle matière",
      subtitle: "Votre demande sera examinée par l'équipe AllAboard",
      nameLabel: "Nom de la matière",
      namePlaceholder: "Ex: Philosophie, Architecture, Marketing…",
      whyLabel: "Pourquoi cette matière ?",
      whyPlaceholder:
        "Décrivez brièvement l'intérêt d'ajouter cette matière à la plateforme…",
      info: "Si approuvée, la matière sera disponible pour tous les étudiants.",
      cancel: "Annuler",
      submit: "Envoyer la demande",
    },
    cgu: {
      welcome: "Bienvenue sur AllAboard",
      subtitle: "Avant de continuer, une dernière étape",
      body: "Pour accéder à AllAboard, vous devez lire et accepter nos Conditions Générales d'Utilisation, notre Politique de confidentialité ainsi que nos Mentions légales.",
      checkbox:
        "J'ai lu et j'accepte les Conditions Générales d'Utilisation, la Politique de confidentialité et les Mentions légales de AllAboard.",
      submit: "Accéder à AllAboard",
    },
  },
  legal: {
    updatedPrefix: "Dernière mise à jour :",
    back: "← Retour",
    privacyLink: "Politique de confidentialité",
    legalLink: "Mentions légales",
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
  moderation: {
    title: "File de modération",
    subtitle: (count) =>
      `Contenu en attente — ${count} élément${count !== 1 ? "s" : ""}`,
    denylist: "Gérer la denylist",
    postsTitle: "Posts",
    commentsTitle: "Commentaires",
    pendingBadge: "En attente",
    replyToPrefix: "En réponse à :",
    approve: "Approuver",
    reject: "Rejeter",
    postsEmpty: "Aucun post en attente de modération.",
    commentsEmpty: "Aucun commentaire en attente de modération.",
  },
  adminUsers: {
    title: "Utilisateurs",
    total: (count) => `Total: ${count} utilisateurs`,
    createAdmin: "Créer un administrateur",
    back: "Retour au tableau de bord",
    columns: {
      name: "Nom",
      email: "Email",
      posts: "Posts",
      comments: "Commentaires",
      role: "Rôle",
      createdAt: "Créé le",
      actions: "Actions",
    },
    roleAdmin: "Admin",
    roleStudent: "Étudiant",
    mentorBadge: "Mentor",
    demoteAdmin: "Rétrograder admin",
    promoteAdmin: "Promouvoir admin",
    removeMentor: "Retirer mentor",
    promoteMentor: "Nommer mentor",
  },
};

export const legacyLabelsEn: LegacyLabels = {
  brandName: "AllAboard",
  nav: {
    feed: "Home",
    explore: "Subjects",
    resources: "Resources",
    events: "Events",
    messages: "Messages",
  },
  userMenu: {
    profile: "My profile",
    myPosts: "My posts",
    bookmarks: "My bookmarks",
    mentorSpace: "Mentor space",
    adminDashboard: "Admin dashboard",
    signOut: "Sign out",
  },
  footer: {
    rights: (year) => `© ${year} — All rights reserved`,
    cgu: "Terms",
    privacy: "Privacy",
    legal: "Legal notice",
  },
  landing: {
    eyebrow: "Real-time peer tutoring",
    headingLead: "The space where students",
    headingAccent: "actually help each other",
    description:
      "Post a request, get targeted answers, learn from mentors, and share knowledge.",
    pills: ["Targeted social feed", "Real-time chat", "Browse by subject"],
  },
  subjectCard: {
    requests: (count) =>
      `${count.toLocaleString("en-US")} requests`,
    proposeTitle: "Suggest a subject",
    proposeDescription: "Can't find your subject? Request to add it!",
    proposeAction: "Submit a request",
  },
  auth: {
    loginTitle: "Sign in",
    loginSubtitle: "Access your AllAboard account",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    submit: "Sign in",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    registerEyebrow: "Create an account",
    registerHeading: "Join a community that actually solves problems.",
    registerDescription:
      "Sign up to post requests, help other students and switch to instant messaging.",
    registerTitle: "Create an account",
    registerSubtitle: "A few details and your space is ready.",
    fullName: "Full name",
    educationLevel: "Level",
    educationLevelPlaceholder: "E.g. Computer science (Bachelor)",
    headline: "Headline",
    headlinePlaceholder: "E.g. Full-stack student passionate about math",
    passwordConfirmation: "Confirmation",
    passwordHint: "1 uppercase, 1 digit, 1 special character",
    registerSubmit: "Create my account",
    hasAccount: "Already have an account?",
    signIn: "Sign in",
    forgotTitle: "Forgot your password?",
    forgotSubtitle: "Enter your email to receive reset instructions.",
    forgotSubmit: "Send instructions",
  },
  explore: {
    title: "Explore",
    subtitle: "Browse help requests by subject",
  },
  resources: {
    title: "Resources",
    subtitle: "Guides and learning resources shared by the AllAboard community.",
    publishCta: "Publish a resource",
    searchPlaceholder: "Search by title, content, subject or tag…",
    searchButton: "Search",
  },
  feed: {
    recentTitle: "Recently viewed",
    recentEmpty: "Posts you view will appear here.",
    unansweredTitle: "Unanswered",
    unansweredEmpty: "All posts have at least one reply!",
    searchTitle: "Search",
    searchPlaceholder: "Title, content, tag…",
    contributionsTitle: "Latest contributions",
    contributionsEmpty: "Your replies will appear here.",
    quickReplyPlaceholder: "Write a quick reply…",
    quickReplySubmit: "Reply",
    scrollTop: "Back to top",
  },
  events: {
    title: "Events",
    subtitle: "Hackathons, open days, conferences and forums curated for you.",
    upcomingTitle: "Upcoming",
    filterAll: "All",
    filterGeneral: "General",
    registerCta: "Register",
    onlineBadge: "Online",
  },
  messages: {
    title: "Messages",
    searchPlaceholder: "Search…",
    emptySelection: "Select a conversation",
    startConversation: "Start the conversation",
  },
  profile: {
    aboutTitle: "About",
    levelPrefix: "Level:",
    sendMessage: "Send a message",
    statsPosts: "Published requests",
    statsReplies: "Replies given",
    statsRating: "Average rating",
    tabPosts: "Requests",
    tabReplies: "Replies",
    postsEmpty: "This member hasn't published any requests yet.",
    repliesEmpty: "This member hasn't replied to any requests yet.",
    replyOnPrefix: "On:",
    publishedPrefix: "published",
  },
  admin: {
    title: "Admin dashboard",
    subtitle: "Manage the app and users",
    stats: {
      posts: "Published posts",
      users: "Users",
      subjectRequests: "Subject requests",
      pendingResources: "Pending resources",
      moderation: "Awaiting moderation",
    },
    actionsTitle: "Actions",
    actions: {
      managePosts: "Manage posts",
      viewUsers: "View users",
      sendMessage: "Send a message",
      subjectRequests: "Subject requests",
      createAdmin: "Create an admin",
      validateResources: "Resources to review",
      events: "Events",
      moderation: "Moderation",
    },
  },
  mobileNav: {
    home: "Home",
    explore: "Explore",
    messages: "Messages",
    profile: "Profile",
    createAria: "New request",
  },
  modals: {
    createPost: {
      title: "New request",
      requestTitle: "Request title",
      subject: "Subject",
      subjectPlaceholder: "Choose a subject…",
      body: "Description",
      bodyPlaceholder: "Describe your problem or question…",
      submit: "Publish request",
    },
    subjectRequest: {
      title: "Suggest a new subject",
      subtitle: "Your request will be reviewed by the AllAboard team",
      nameLabel: "Subject name",
      namePlaceholder: "E.g. Philosophy, Architecture, Marketing…",
      whyLabel: "Why this subject?",
      whyPlaceholder:
        "Briefly describe why this subject should be added to the platform…",
      info: "If approved, the subject will be available to all students.",
      cancel: "Cancel",
      submit: "Submit request",
    },
    cgu: {
      welcome: "Welcome to AllAboard",
      subtitle: "One last step before you continue",
      body: "To access AllAboard, you must read and accept our Terms of Use, Privacy Policy and Legal Notice.",
      checkbox:
        "I have read and accept the Terms of Use, Privacy Policy and Legal Notice of AllAboard.",
      submit: "Access AllAboard",
    },
  },
  legal: {
    updatedPrefix: "Last updated:",
    back: "← Back",
    privacyLink: "Privacy Policy",
    legalLink: "Legal notice",
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
  moderation: {
    title: "Moderation queue",
    subtitle: (count) =>
      `Pending content — ${count} item${count !== 1 ? "s" : ""}`,
    denylist: "Manage denylist",
    postsTitle: "Posts",
    commentsTitle: "Comments",
    pendingBadge: "Pending",
    replyToPrefix: "In reply to:",
    approve: "Approve",
    reject: "Reject",
    postsEmpty: "No posts awaiting moderation.",
    commentsEmpty: "No comments awaiting moderation.",
  },
  adminUsers: {
    title: "Users",
    total: (count) => `Total: ${count} users`,
    createAdmin: "Create an admin",
    back: "Back to dashboard",
    columns: {
      name: "Name",
      email: "Email",
      posts: "Posts",
      comments: "Comments",
      role: "Role",
      createdAt: "Created",
      actions: "Actions",
    },
    roleAdmin: "Admin",
    roleStudent: "Student",
    mentorBadge: "Mentor",
    demoteAdmin: "Demote admin",
    promoteAdmin: "Promote admin",
    removeMentor: "Remove mentor",
    promoteMentor: "Make mentor",
  },
};
