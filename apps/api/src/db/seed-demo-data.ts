/** Stable demo UUIDs — idempotent upserts on re-run (migrate / db:seed). */
export const SEED_HELP_REQUEST_IDS = {
  reactUseEffect: "a1000001-0000-4000-8000-000000000001",
  flexboxMobile: "a1000001-0000-4000-8000-000000000002",
  pythonKeyError: "a1000001-0000-4000-8000-000000000003",
  pytorchOverfit: "a1000001-0000-4000-8000-000000000004",
  dockerProd: "a1000001-0000-4000-8000-000000000005",
  railsAssociations: "a1000001-0000-4000-8000-000000000006",
  xssTypes: "a1000001-0000-4000-8000-000000000007",
  sqlJoinPerf: "a1000001-0000-4000-8000-000000000008",
  dijkstra: "a1000001-0000-4000-8000-000000000009",
  jsPrototype: "a1000001-0000-4000-8000-000000000010",
  asyncAwait: "a1000001-0000-4000-8000-000000000011",
  nginxHttps: "a1000001-0000-4000-8000-000000000012",
  bobFirstPost: "a1000001-0000-4000-8000-000000000013",
  flaggedDemo: "a1000001-0000-4000-8000-000000000014",
} as const;

export const SEED_RESPONSE_IDS = {
  lucasUseEffect: "a2000001-0000-4000-8000-000000000001",
  thomasUseEffect: "a2000001-0000-4000-8000-000000000002",
  marieUseEffect: "a2000001-0000-4000-8000-000000000003",
  lucasFlexbox: "a2000001-0000-4000-8000-000000000004",
  kevinFlexbox: "a2000001-0000-4000-8000-000000000005",
  sofiaKeyError: "a2000001-0000-4000-8000-000000000006",
  sofiaOverfit: "a2000001-0000-4000-8000-000000000007",
  lucasDocker: "a2000001-0000-4000-8000-000000000008",
  lucasRails: "a2000001-0000-4000-8000-000000000009",
  kevinXss: "a2000001-0000-4000-8000-000000000010",
  sofiaSql: "a2000001-0000-4000-8000-000000000011",
  aliceBobHelp: "a2000001-0000-4000-8000-000000000012",
  flaggedResponse: "a2000001-0000-4000-8000-000000000013",
} as const;

export const SEED_RESOURCE_IDS = {
  jsClosures: "a3000001-0000-4000-8000-000000000001",
  pythonPandas: "a3000001-0000-4000-8000-000000000002",
  dockerCompose: "a3000001-0000-4000-8000-000000000003",
} as const;

export const SEED_SUBJECT_REQUEST_IDS = {
  rustPending: "a4000001-0000-4000-8000-000000000001",
  goRejected: "a4000001-0000-4000-8000-000000000002",
} as const;

export const SEED_DENYLIST_IDS = {
  spamLink: "a5000001-0000-4000-8000-000000000001",
  phoneLeak: "a5000001-0000-4000-8000-000000000002",
} as const;

export const SEED_MESSAGE_IDS = {
  hugoLucas1: "a6000001-0000-4000-8000-000000000001",
  hugoLucas2: "a6000001-0000-4000-8000-000000000002",
  hugoLucas3: "a6000001-0000-4000-8000-000000000003",
  bobAlice1: "a6000001-0000-4000-8000-000000000004",
  bobAlice2: "a6000001-0000-4000-8000-000000000005",
  camilleSofia1: "a6000001-0000-4000-8000-000000000006",
  camilleSofia2: "a6000001-0000-4000-8000-000000000007",
} as const;

export type DemoHelpRequestSpec = {
  id: string;
  authorEmail: string;
  subjectSlug: string;
  title: string;
  body: string;
  tags: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  urgent?: boolean;
  status?: "open" | "resolved";
  mentorHelpRequested?: boolean;
  educationLevel?: string;
  aiSummary?: string;
  flaggedForModeration?: boolean;
  hoursAgo: number;
};

export type DemoResponseSpec = {
  id: string;
  helpRequestId: string;
  authorEmail: string;
  body: string;
  codeSnippet?: string;
  codeLanguage?: string;
  flaggedForModeration?: boolean;
  hoursAgo: number;
};

export type DemoLikeSpec = {
  userEmail: string;
  helpRequestId: string;
};

export type DemoBookmarkSpec = {
  userEmail: string;
  helpRequestId: string;
};

export type DemoResourceSpec = {
  id: string;
  authorEmail: string;
  subjectSlug: string;
  title: string;
  body: string;
  tags: string[];
  status: "pending" | "published" | "rejected";
};

export type DemoSubjectRequestSpec = {
  id: string;
  authorEmail: string;
  name: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
};

export type DemoDenylistSpec = {
  id: string;
  label: string;
  pattern: string;
  active?: boolean;
};

export type DemoConversationSpec = {
  participantEmails: [string, string];
  topic?: string;
  messages: Array<{
    id: string;
    authorEmail: string;
    body: string;
    hoursAgo: number;
  }>;
};

export type DemoMentorSubjectLink = {
  mentorEmail: string;
  subjectSlugs: string[];
};

/** Extra subjects beyond the MVP catalogue in defaultSeedSubjects(). */
export function extraSeedSubjects() {
  return [
    {
      name: "Python",
      slug: "python",
      icon: "python",
      accentColor: "#60a5fa",
      description: "Scripts, data science, Django, automatisation",
    },
    {
      name: "Bases de données",
      slug: "bases-de-donnees",
      icon: "database",
      accentColor: "#a78bfa",
      description: "SQL, PostgreSQL, modélisation, requêtes",
    },
    {
      name: "DevOps & Cloud",
      slug: "devops-cloud",
      icon: "cloud",
      accentColor: "#22d3ee",
      description: "Docker, CI/CD, Linux, déploiement",
    },
    {
      name: "Intelligence artificielle",
      slug: "intelligence-artificielle",
      icon: "brain",
      accentColor: "#4ade80",
      description: "Machine learning, LLMs, prompt engineering",
    },
    {
      name: "Algorithmique",
      slug: "algorithmique",
      icon: "diagram",
      accentColor: "#fb923c",
      description: "Structures de données, graphes, complexité",
    },
  ];
}

/** Demo personas — same password as bob/alice via DEV_SEED_PASSWORD. */
export function demoSeedUsers() {
  return [
    {
      email: "lucas@dev.local",
      role: "mentor" as const,
      fullName: "Lucas M.",
      headline: "Ingénieur full-stack — Mentor JS & Ruby on Rails",
      educationLevel: "Master Informatique",
      bio: "5 ans d'expérience web. Je partage React, Rails, APIs REST et bonnes pratiques de code.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      certificationTags: ["javascript", "react", "ruby", "rails", "html-css"],
    },
    {
      email: "sofia@dev.local",
      role: "mentor" as const,
      fullName: "Sofia T.",
      headline: "Data Engineer — Mentor Python & IA",
      educationLevel: "Master Data Science",
      bio: "Spécialisée ML et pipelines de données. Python, pandas, scikit-learn et LLMs.",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      certificationTags: ["python", "intelligence-artificielle", "bases-de-donnees"],
    },
    {
      email: "kevin@dev.local",
      role: "mentor" as const,
      fullName: "Kévin A.",
      headline: "Ingénieur DevOps — Mentor Cloud & Sécurité",
      educationLevel: "Licence Pro Systèmes Réseaux",
      bio: "Docker, Kubernetes, Linux hardening et bases du pentesting. Certifié AWS.",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
      certificationTags: ["devops-cloud", "algorithmique"],
    },
    {
      email: "hugo@dev.local",
      role: "student" as const,
      fullName: "Hugo B.",
      headline: "BTS SIO — Développement web",
      educationLevel: "BTS SIO",
      bio: "En formation dev web. Projets React, début Rails. Passionné cybersécurité.",
      avatarUrl:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    },
    {
      email: "marie@dev.local",
      role: "student" as const,
      fullName: "Marie L.",
      headline: "Développeuse front-end junior",
      educationLevel: "Bootcamp Le Wagon",
      bio: "Sortie du Wagon il y a 3 mois. CSS, React, premier poste en vue.",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      email: "camille@dev.local",
      role: "student" as const,
      fullName: "Camille R.",
      headline: "Licence Informatique — Spécialisation IA",
      educationLevel: "Licence 3 Informatique",
      bio: "Modèles PyTorch, prompt engineering, veille IA éthique.",
      avatarUrl:
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=100&h=100&fit=crop",
    },
    {
      email: "thomas@dev.local",
      role: "student" as const,
      fullName: "Thomas D.",
      headline: "Autodidacte — Python & DevOps",
      educationLevel: "Autodidacte",
      bio: "Reconversion depuis 1 an. Python, Linux, Docker/Kubernetes.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      email: "romain@dev.local",
      role: "student" as const,
      fullName: "Romain V.",
      headline: "Master Cybersécurité",
      educationLevel: "Master 1 Sécurité Informatique",
      bio: "CTF, pentesting web, cryptographie, reverse engineering.",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    {
      email: "lea@dev.local",
      role: "student" as const,
      fullName: "Léa P.",
      headline: "DUT Informatique — Backend & BDD",
      educationLevel: "DUT Informatique",
      bio: "Bases de données et backend Python/Django. Recherche un stage.",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    },
  ];
}

export function demoMentorSubjectLinks(): DemoMentorSubjectLink[] {
  return [
    {
      mentorEmail: "alice@dev.local",
      subjectSlugs: ["react", "javascript", "rails"],
    },
    {
      mentorEmail: "lucas@dev.local",
      subjectSlugs: ["javascript", "ruby", "html-css", "rails"],
    },
    {
      mentorEmail: "sofia@dev.local",
      subjectSlugs: ["python", "intelligence-artificielle", "bases-de-donnees", "algorithmique"],
    },
    {
      mentorEmail: "kevin@dev.local",
      subjectSlugs: ["devops-cloud", "algorithmique"],
    },
  ];
}

export function demoHelpRequests(): DemoHelpRequestSpec[] {
  return [
    {
      id: SEED_HELP_REQUEST_IDS.reactUseEffect,
      authorEmail: "hugo@dev.local",
      subjectSlug: "react",
      title: "Problème avec React useEffect et boucle infinie",
      body: "Mon composant re-render en boucle à cause de useEffect. Je ne comprends pas pourquoi mon state se met à jour sans arrêt alors que je n'ai rien changé dans les dépendances.",
      codeSnippet:
        "useEffect(() => {\n  fetchData();\n}, [data]); // data change à chaque render !",
      codeLanguage: "javascript",
      urgent: true,
      mentorHelpRequested: true,
      educationLevel: "BTS SIO",
      tags: ["react", "hooks", "useeffect"],
      aiSummary: "Boucle infinie useEffect — dépendance objet/tableau recréé à chaque render.",
      hoursAgo: 2,
    },
    {
      id: SEED_HELP_REQUEST_IDS.flexboxMobile,
      authorEmail: "marie@dev.local",
      subjectSlug: "html-css",
      title: "Mon flexbox ne centre pas verticalement sur mobile",
      body: "J'essaie de centrer un élément verticalement avec flexbox mais ça marche sur desktop et pas sur mobile.",
      codeSnippet:
        ".container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 100vh;\n}",
      codeLanguage: "css",
      educationLevel: "Bootcamp",
      tags: ["css", "flexbox", "responsive"],
      hoursAgo: 5,
    },
    {
      id: SEED_HELP_REQUEST_IDS.pythonKeyError,
      authorEmail: "thomas@dev.local",
      subjectSlug: "python",
      title: "KeyError sur un dictionnaire — je comprends pas pourquoi",
      body: "Mon script plante avec KeyError alors que j'ai vérifié que la clé existe. Le problème arrive seulement quand je parse un fichier JSON externe.",
      codeSnippet:
        "data = json.load(f)\nprint(data['user']['email'])  # KeyError: 'user'",
      codeLanguage: "python",
      urgent: true,
      educationLevel: "Autodidacte",
      tags: ["python", "json"],
      hoursAgo: 24,
    },
    {
      id: SEED_HELP_REQUEST_IDS.pytorchOverfit,
      authorEmail: "camille@dev.local",
      subjectSlug: "intelligence-artificielle",
      title: "Comment éviter l'overfitting sur mon modèle PyTorch ?",
      body: "97% d'accuracy sur le train set mais seulement 63% sur le test set. J'ai réduit les epochs sans succès.",
      codeSnippet:
        "self.fc1 = nn.Linear(784, 512)\nself.fc2 = nn.Linear(512, 256)\nself.fc3 = nn.Linear(256, 10)",
      codeLanguage: "python",
      educationLevel: "Licence 3",
      tags: ["pytorch", "deep-learning"],
      hoursAgo: 9,
    },
    {
      id: SEED_HELP_REQUEST_IDS.dockerProd,
      authorEmail: "hugo@dev.local",
      subjectSlug: "devops-cloud",
      title: "Mon container Docker ne trouve pas l'image en production",
      body: "En local ça tourne parfaitement mais sur le serveur j'ai une erreur 'image not found'. J'utilise docker-compose.",
      codeSnippet:
        "services:\n  app:\n    image: monuser/monapp:latest",
      codeLanguage: "yaml",
      urgent: true,
      educationLevel: "BTS SIO",
      tags: ["docker", "production"],
      hoursAgo: 3,
    },
    {
      id: SEED_HELP_REQUEST_IDS.railsAssociations,
      authorEmail: "marie@dev.local",
      subjectSlug: "rails",
      title: "Différence entre has_many :through et has_and_belongs_to_many ?",
      body: "J'hésite entre has_many :through et HABTM pour une relation Users ↔ Projets. Quelle est la bonne pratique ?",
      codeSnippet:
        "has_many :participations\nhas_many :projects, through: :participations",
      codeLanguage: "ruby",
      status: "resolved",
      educationLevel: "Bootcamp",
      tags: ["rails", "activerecord"],
      hoursAgo: 48,
    },
    {
      id: SEED_HELP_REQUEST_IDS.xssTypes,
      authorEmail: "romain@dev.local",
      subjectSlug: "javascript",
      title: "XSS stocké vs réfléchi — quelle différence concrète ?",
      body: "Je prépare un CTF et je ne comprends pas bien la différence entre XSS stocké et réfléchi en termes d'exploitation.",
      codeSnippet:
        "https://site.com/search?q=<script>alert(1)</script>",
      codeLanguage: "html",
      educationLevel: "Master 1",
      tags: ["xss", "owasp", "ctf"],
      hoursAgo: 6,
    },
    {
      id: SEED_HELP_REQUEST_IDS.sqlJoinPerf,
      authorEmail: "lea@dev.local",
      subjectSlug: "bases-de-donnees",
      title: "Optimiser une requête SQL avec plusieurs jointures",
      body: "Ma requête avec 3 JOIN est très lente sur 500k lignes. EXPLAIN ANALYZE montre toujours un sequential scan.",
      codeSnippet:
        "SELECT u.name, p.title\nFROM users u\nJOIN posts p ON p.user_id = u.id\nWHERE u.created_at > '2024-01-01';",
      codeLanguage: "sql",
      urgent: true,
      educationLevel: "DUT",
      tags: ["sql", "index", "performance"],
      hoursAgo: 4,
    },
    {
      id: SEED_HELP_REQUEST_IDS.dijkstra,
      authorEmail: "thomas@dev.local",
      subjectSlug: "algorithmique",
      title: "Algorithme de Dijkstra — implémentation incorrecte",
      body: "Je comprends le principe théorique mais mon implémentation donne des résultats faux sur des graphes pondérés.",
      codeSnippet:
        "def dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}",
      codeLanguage: "python",
      educationLevel: "Autodidacte",
      tags: ["graphes", "dijkstra"],
      hoursAgo: 12,
    },
    {
      id: SEED_HELP_REQUEST_IDS.jsPrototype,
      authorEmail: "hugo@dev.local",
      subjectSlug: "javascript",
      title: "Comment fonctionne la prototype chain en JavaScript ?",
      body: "Je ne comprends pas la notion de prototype en JS. Quelle est la différence avec les classes ?",
      codeSnippet:
        "function Animal(name) { this.name = name; }\nAnimal.prototype.speak = function() { ... };",
      codeLanguage: "javascript",
      educationLevel: "BTS SIO",
      tags: ["javascript", "prototype"],
      hoursAgo: 26,
    },
    {
      id: SEED_HELP_REQUEST_IDS.asyncAwait,
      authorEmail: "marie@dev.local",
      subjectSlug: "javascript",
      title: "Async/await vs Promises — quand utiliser quoi ?",
      body: "Je maîtrise les Promises mais je vois partout async/await. Y a-t-il des cas où les Promises restent préférables ?",
      codeSnippet:
        "const data = await fetch(url).then(r => r.json());",
      codeLanguage: "javascript",
      educationLevel: "Bootcamp",
      tags: ["javascript", "async"],
      hoursAgo: 72,
    },
    {
      id: SEED_HELP_REQUEST_IDS.nginxHttps,
      authorEmail: "romain@dev.local",
      subjectSlug: "devops-cloud",
      title: "Configurer HTTPS avec Nginx et Let's Encrypt sur VPS",
      body: "Certbot plante avec une erreur de port 80 sur mon VPS Ubuntu.",
      codeSnippet: "sudo certbot --nginx -d monsite.com",
      codeLanguage: "bash",
      urgent: true,
      educationLevel: "Master 1",
      tags: ["nginx", "https", "letsencrypt"],
      hoursAgo: 0.5,
    },
    {
      id: SEED_HELP_REQUEST_IDS.bobFirstPost,
      authorEmail: "bob@dev.local",
      subjectSlug: "rails",
      title: "Migration Rails → Fastify : par où commencer ?",
      body: "Je porte une app Rails vers un monorepo Node. Comment structurer les routes et l'auth sans tout réécrire d'un coup ?",
      tags: ["rails", "api", "migration"],
      mentorHelpRequested: true,
      educationLevel: "Étudiant THP",
      hoursAgo: 8,
    },
    {
      id: SEED_HELP_REQUEST_IDS.flaggedDemo,
      authorEmail: "thomas@dev.local",
      subjectSlug: "javascript",
      title: "[DEMO MODÉRATION] Contenu signalé automatiquement",
      body: "Post de démonstration pour la file admin — contient un motif denylist volontaire : spam-link-demo",
      tags: ["demo", "moderation"],
      flaggedForModeration: true,
      hoursAgo: 36,
    },
  ];
}

export function demoResponses(): DemoResponseSpec[] {
  return [
    {
      id: SEED_RESPONSE_IDS.lucasUseEffect,
      helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect,
      authorEmail: "lucas@dev.local",
      body: "Le souci vient des dépendances : fetchData modifie `data`, ce qui relance l'effet. Essaie `[]` pour un appel unique, ou useCallback pour stabiliser fetchData.",
      hoursAgo: 1,
    },
    {
      id: SEED_RESPONSE_IDS.thomasUseEffect,
      helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect,
      authorEmail: "thomas@dev.local",
      body: "Si tu dois relancer fetchData quand une vraie condition change, utilise un ID primitif comme dépendance, jamais un objet directement.",
      hoursAgo: 0.75,
    },
    {
      id: SEED_RESPONSE_IDS.marieUseEffect,
      helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect,
      authorEmail: "marie@dev.local",
      body: "J'avais exactement le même problème ! useCallback a tout résolu pour moi.",
      hoursAgo: 0.5,
    },
    {
      id: SEED_RESPONSE_IDS.lucasFlexbox,
      helpRequestId: SEED_HELP_REQUEST_IDS.flexboxMobile,
      authorEmail: "lucas@dev.local",
      body: "Vérifie que html, body ont bien height: 100%. Si le parent n'a pas de hauteur définie, 100vh sur .container ne suffira pas.",
      hoursAgo: 3,
    },
    {
      id: SEED_RESPONSE_IDS.kevinFlexbox,
      helpRequestId: SEED_HELP_REQUEST_IDS.flexboxMobile,
      authorEmail: "kevin@dev.local",
      body: "Sur mobile, utilise `height: 100dvh` (dynamic viewport height) au lieu de `100vh` pour iOS/Android.",
      hoursAgo: 2,
    },
    {
      id: SEED_RESPONSE_IDS.sofiaKeyError,
      helpRequestId: SEED_HELP_REQUEST_IDS.pythonKeyError,
      authorEmail: "sofia@dev.local",
      body: "Le JSON externe a probablement une structure différente. Fais un `print(data.keys())` et utilise `data.get('user', {})`.",
      hoursAgo: 20,
    },
    {
      id: SEED_RESPONSE_IDS.sofiaOverfit,
      helpRequestId: SEED_HELP_REQUEST_IDS.pytorchOverfit,
      authorEmail: "sofia@dev.local",
      body: "Ajoute du Dropout (0.3-0.5), BatchNorm et L2 regularization (weight_decay). Data augmentation si tu es sur des images.",
      hoursAgo: 7,
    },
    {
      id: SEED_RESPONSE_IDS.lucasDocker,
      helpRequestId: SEED_HELP_REQUEST_IDS.dockerProd,
      authorEmail: "lucas@dev.local",
      body: "Fais `docker pull monuser/monapp:latest` sur le serveur avant le docker-compose up. L'image n'est pas téléchargée automatiquement.",
      hoursAgo: 2,
    },
    {
      id: SEED_RESPONSE_IDS.lucasRails,
      helpRequestId: SEED_HELP_REQUEST_IDS.railsAssociations,
      authorEmail: "lucas@dev.local",
      body: "Préfère has_many :through. HABTM ne permet pas d'ajouter des attributs sur la table de jointure (rôle, date d'invitation…).",
      hoursAgo: 24,
    },
    {
      id: SEED_RESPONSE_IDS.kevinXss,
      helpRequestId: SEED_HELP_REQUEST_IDS.xssTypes,
      authorEmail: "kevin@dev.local",
      body: "XSS réfléchi : payload dans la requête HTTP, renvoyé immédiatement. XSS stocké : sauvegardé en base, servi à tous — bien plus dangereux.",
      hoursAgo: 4,
    },
    {
      id: SEED_RESPONSE_IDS.sofiaSql,
      helpRequestId: SEED_HELP_REQUEST_IDS.sqlJoinPerf,
      authorEmail: "sofia@dev.local",
      body: "Ajoute un index composite sur (user_id, created_at). EXPLAIN (ANALYZE, BUFFERS) pour voir les I/O.",
      hoursAgo: 3,
    },
    {
      id: SEED_RESPONSE_IDS.aliceBobHelp,
      helpRequestId: SEED_HELP_REQUEST_IDS.bobFirstPost,
      authorEmail: "alice@dev.local",
      body: "Commence par extraire les routes read-only et l'auth. Garde Rails en parallèle le temps de valider le contrat OpenAPI avec le BFF Next.",
      hoursAgo: 6,
    },
    {
      id: SEED_RESPONSE_IDS.flaggedResponse,
      helpRequestId: SEED_HELP_REQUEST_IDS.flaggedDemo,
      authorEmail: "hugo@dev.local",
      body: "[DEMO] Réponse signalée pour test modération admin — phone-leak-demo",
      flaggedForModeration: true,
      hoursAgo: 35,
    },
  ];
}

export function demoLikes(): DemoLikeSpec[] {
  return [
    { userEmail: "lucas@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect },
    { userEmail: "thomas@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect },
    { userEmail: "marie@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect },
    { userEmail: "sofia@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.flexboxMobile },
    { userEmail: "kevin@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.flexboxMobile },
    { userEmail: "marie@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.pythonKeyError },
    { userEmail: "camille@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.pytorchOverfit },
    { userEmail: "lucas@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.dockerProd },
    { userEmail: "kevin@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.dockerProd },
    { userEmail: "sofia@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.railsAssociations },
    { userEmail: "kevin@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.xssTypes },
    { userEmail: "sofia@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.sqlJoinPerf },
    { userEmail: "alice@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.bobFirstPost },
    { userEmail: "lucas@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.bobFirstPost },
  ];
}

export function demoBookmarks(): DemoBookmarkSpec[] {
  return [
    { userEmail: "hugo@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.reactUseEffect },
    { userEmail: "marie@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.flexboxMobile },
    { userEmail: "camille@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.pytorchOverfit },
    { userEmail: "bob@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.bobFirstPost },
    { userEmail: "romain@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.nginxHttps },
    { userEmail: "lea@dev.local", helpRequestId: SEED_HELP_REQUEST_IDS.sqlJoinPerf },
  ];
}

export function demoResources(): DemoResourceSpec[] {
  return [
    {
      id: SEED_RESOURCE_IDS.jsClosures,
      authorEmail: "lucas@dev.local",
      subjectSlug: "javascript",
      title: "Comprendre les closures en JavaScript",
      body: "Une closure est une fonction qui se souvient des variables de son environnement lexical.\n\n```javascript\nfunction compteur() {\n  let count = 0;\n  return () => ++count;\n}\n```",
      tags: ["javascript", "closures"],
      status: "published",
    },
    {
      id: SEED_RESOURCE_IDS.pythonPandas,
      authorEmail: "sofia@dev.local",
      subjectSlug: "python",
      title: "Pandas — filtrer et agréger un DataFrame",
      body: "Guide rapide : `df.query()`, `groupby()` et `agg()` pour explorer un dataset tabulaire.",
      tags: ["python", "pandas", "data"],
      status: "pending",
    },
    {
      id: SEED_RESOURCE_IDS.dockerCompose,
      authorEmail: "kevin@dev.local",
      subjectSlug: "devops-cloud",
      title: "Docker Compose multi-services (brouillon rejeté)",
      body: "Brouillon incomplet — exemple de ressource rejetée en modération mentor.",
      tags: ["docker"],
      status: "rejected",
    },
  ];
}

export function demoSubjectRequests(): DemoSubjectRequestSpec[] {
  return [
    {
      id: SEED_SUBJECT_REQUEST_IDS.rustPending,
      authorEmail: "hugo@dev.local",
      name: "Rust",
      description: "Langage système, ownership, WebAssembly",
      status: "pending",
    },
    {
      id: SEED_SUBJECT_REQUEST_IDS.goRejected,
      authorEmail: "marie@dev.local",
      name: "Go",
      description: "Doublon avec une matière existante — exemple rejeté",
      status: "rejected",
    },
  ];
}

export function demoDenylistPatterns(): DemoDenylistSpec[] {
  return [
    {
      id: SEED_DENYLIST_IDS.spamLink,
      label: "Demo spam link",
      pattern: "spam-link-demo",
      active: true,
    },
    {
      id: SEED_DENYLIST_IDS.phoneLeak,
      label: "Demo phone leak",
      pattern: "phone-leak-demo",
      active: true,
    },
  ];
}

export function demoConversations(): DemoConversationSpec[] {
  return [
    {
      participantEmails: ["hugo@dev.local", "lucas@dev.local"],
      topic: "useEffect — suivi",
      messages: [
        {
          id: SEED_MESSAGE_IDS.hugoLucas1,
          authorEmail: "hugo@dev.local",
          body: "Merci pour ta réponse sur useEffect ! J'ai essayé useCallback mais j'ai encore un double fetch au montage.",
          hoursAgo: 0.4,
        },
        {
          id: SEED_MESSAGE_IDS.hugoLucas2,
          authorEmail: "lucas@dev.local",
          body: "En React 18 Strict Mode, les effets montent deux fois en dev — c'est normal. Vérifie en prod ou désactive Strict Mode pour tester.",
          hoursAgo: 0.3,
        },
        {
          id: SEED_MESSAGE_IDS.hugoLucas3,
          authorEmail: "hugo@dev.local",
          body: "Ah ok, ça explique tout. Merci Lucas !",
          hoursAgo: 0.2,
        },
      ],
    },
    {
      participantEmails: ["bob@dev.local", "alice@dev.local"],
      topic: "Migration API",
      messages: [
        {
          id: SEED_MESSAGE_IDS.bobAlice1,
          authorEmail: "bob@dev.local",
          body: "Alice, tu as un exemple de contrat OpenAPI pour les help-requests ?",
          hoursAgo: 5,
        },
        {
          id: SEED_MESSAGE_IDS.bobAlice2,
          authorEmail: "alice@dev.local",
          body: "Oui — regarde apps/api/openapi.yaml section HelpRequests. Le BFF Next proxy déjà GET /feed.",
          hoursAgo: 4.5,
        },
      ],
    },
    {
      participantEmails: ["camille@dev.local", "sofia@dev.local"],
      topic: "Overfitting PyTorch",
      messages: [
        {
          id: SEED_MESSAGE_IDS.camilleSofia1,
          authorEmail: "camille@dev.local",
          body: "Sofia, ton conseil Dropout a aidé ! Accuracy test à 81% maintenant.",
          hoursAgo: 6,
        },
        {
          id: SEED_MESSAGE_IDS.camilleSofia2,
          authorEmail: "sofia@dev.local",
          body: "Super ! Prochaine étape : early stopping et cross-validation pour stabiliser.",
          hoursAgo: 5.5,
        },
      ],
    },
  ];
}
