export type LegalSection = {
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export type LegalPageContent = {
  slug: "cgu" | "privacy" | "mentions";
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const legacyLegalCguFr: LegalPageContent = {
  slug: "cgu",
  title: "Conditions Générales d'Utilisation",
  updatedAt: "19 mars 2026",
  sections: [
    {
      title: "1. Présentation du service",
      paragraphs: [
        "AllAboard est une plateforme d'entraide étudiante permettant aux utilisateurs de publier des requêtes d'aide, de répondre à celles d'autres étudiants, et de communiquer en temps réel. Le service est accessible à toute personne disposant d'un compte valide.",
      ],
    },
    {
      title: "2. Acceptation des CGU",
      paragraphs: [
        "L'utilisation de AllAboard implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation. Tout utilisateur qui s'inscrit sur la plateforme s'engage à les respecter.",
      ],
    },
    {
      title: "3. Inscription et compte utilisateur",
      paragraphs: [
        "Pour accéder aux fonctionnalités de AllAboard, l'utilisateur doit créer un compte en fournissant une adresse e-mail valide et un mot de passe.",
        "Toute utilisation du compte est sous la responsabilité exclusive de l'utilisateur.",
      ],
    },
    {
      title: "4. Règles de conduite",
      paragraphs: ["Les utilisateurs s'engagent à :"],
      listItems: [
        "Adopter un comportement respectueux envers les autres membres",
        "Ne pas publier de contenu offensant, diffamatoire, haineux ou illégal",
        "Ne pas usurper l'identité d'une autre personne",
        "Respecter les droits de propriété intellectuelle des autres utilisateurs",
      ],
    },
    {
      title: "5. Contenu publié",
      paragraphs: [
        "L'utilisateur est seul responsable des contenus qu'il publie sur AllAboard (posts, commentaires, messages).",
        "AllAboard se réserve le droit de supprimer tout contenu ne respectant pas ces CGU, sans préavis.",
      ],
    },
    {
      title: "6. Données personnelles",
      paragraphs: [
        "AllAboard collecte et traite des données personnelles conformément à sa Politique de confidentialité.",
      ],
    },
    {
      title: "7. Suspension et suppression de compte",
      paragraphs: [
        "AllAboard se réserve le droit de suspendre ou supprimer le compte d'un utilisateur en cas de violation des présentes CGU.",
      ],
    },
    {
      title: "8. Limitation de responsabilité",
      paragraphs: [
        "AllAboard est une plateforme d'entraide entre étudiants. Les réponses publiées par les utilisateurs n'engagent pas la responsabilité de AllAboard.",
      ],
    },
    {
      title: "9. Modification des CGU",
      paragraphs: [
        "AllAboard se réserve le droit de modifier les présentes CGU à tout moment.",
      ],
    },
    {
      title: "10. Droit applicable",
      paragraphs: [
        "Les présentes CGU sont soumises au droit français.",
      ],
    },
  ],
};

export const legacyLegalPrivacyFr: LegalPageContent = {
  slug: "privacy",
  title: "Politique de confidentialité",
  updatedAt: "19 mars 2026",
  sections: [
    {
      title: "1. Responsable du traitement",
      paragraphs: [
        "AllAboard est responsable du traitement de vos données personnelles collectées via la plateforme.",
      ],
    },
    {
      title: "2. Données collectées",
      paragraphs: ["Nous collectons les données suivantes :"],
      listItems: [
        "Données d'identification : nom complet, adresse e-mail",
        "Données de profil : headline, niveau d'études, bio",
        "Contenus publiés : posts, commentaires, messages",
      ],
    },
    {
      title: "3. Finalités du traitement",
      paragraphs: [
        "Vos données sont utilisées pour fournir le service, personnaliser votre expérience et assurer la modération.",
      ],
    },
  ],
};

export const legacyLegalMentionsFr: LegalPageContent = {
  slug: "mentions",
  title: "Mentions légales",
  updatedAt: "19 mars 2026",
  sections: [
    {
      title: "1. Éditeur du site",
      paragraphs: [
        "AllAboard — plateforme d'entraide étudiante.",
        "Contact : contact@allaboard.dev",
      ],
    },
    {
      title: "2. Hébergement",
      paragraphs: [
        "Le site est hébergé par un prestataire conforme aux exigences de sécurité en vigueur.",
      ],
    },
  ],
};

export const legacyLegalCguEn: LegalPageContent = {
  slug: "cgu",
  title: "Terms of Use",
  updatedAt: "March 19, 2026",
  sections: [
    {
      title: "1. Service overview",
      paragraphs: [
        "AllAboard is a peer-help platform where students post help requests, reply to others and chat in real time.",
      ],
    },
    {
      title: "2. Acceptance of terms",
      paragraphs: [
        "Using AllAboard means you fully accept these Terms of Use. Registration implies compliance.",
      ],
    },
    {
      title: "3. Registration and account",
      paragraphs: [
        "You must create an account with a valid email and password.",
        "You are solely responsible for activity on your account.",
      ],
    },
    {
      title: "4. Code of conduct",
      paragraphs: ["Users agree to:"],
      listItems: [
        "Behave respectfully toward other members",
        "Not publish offensive, hateful or illegal content",
        "Not impersonate another person",
        "Respect intellectual property rights",
      ],
    },
    {
      title: "5. Published content",
      paragraphs: [
        "You are responsible for posts, comments and messages you publish.",
        "AllAboard may remove content that violates these terms without notice.",
      ],
    },
    {
      title: "6. Personal data",
      paragraphs: [
        "AllAboard processes personal data according to its Privacy Policy.",
      ],
    },
    {
      title: "7. Account suspension",
      paragraphs: [
        "AllAboard may suspend or delete accounts that violate these terms.",
      ],
    },
    {
      title: "8. Liability",
      paragraphs: [
        "User-generated answers do not bind AllAboard's liability as a peer-help platform.",
      ],
    },
    {
      title: "9. Changes to terms",
      paragraphs: ["AllAboard may update these terms at any time."],
    },
    {
      title: "10. Applicable law",
      paragraphs: ["These terms are governed by French law."],
    },
  ],
};

export const legacyLegalPrivacyEn: LegalPageContent = {
  slug: "privacy",
  title: "Privacy Policy",
  updatedAt: "March 19, 2026",
  sections: [
    {
      title: "1. Data controller",
      paragraphs: [
        "AllAboard is responsible for personal data collected through the platform.",
      ],
    },
    {
      title: "2. Data collected",
      paragraphs: ["We collect the following data:"],
      listItems: [
        "Identification data: full name, email address",
        "Profile data: headline, education level, bio",
        "Published content: posts, comments, messages",
      ],
    },
    {
      title: "3. Processing purposes",
      paragraphs: [
        "Your data is used to provide the service, personalize your experience and ensure moderation.",
      ],
    },
  ],
};

export const legacyLegalMentionsEn: LegalPageContent = {
  slug: "mentions",
  title: "Legal notice",
  updatedAt: "March 19, 2026",
  sections: [
    {
      title: "1. Site publisher",
      paragraphs: [
        "AllAboard — peer-help platform for students.",
        "Contact: contact@allaboard.dev",
      ],
    },
    {
      title: "2. Hosting",
      paragraphs: [
        "The site is hosted by a provider meeting current security requirements.",
      ],
    },
  ],
};

export function getLegalPageContent(
  slug: LegalPageContent["slug"],
  locale: "fr" | "en",
): LegalPageContent {
  const map = {
    fr: { cgu: legacyLegalCguFr, privacy: legacyLegalPrivacyFr, mentions: legacyLegalMentionsFr },
    en: { cgu: legacyLegalCguEn, privacy: legacyLegalPrivacyEn, mentions: legacyLegalMentionsEn },
  };
  return map[locale][slug];
}
