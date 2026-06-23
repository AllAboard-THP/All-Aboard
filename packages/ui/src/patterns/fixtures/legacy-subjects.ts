import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Cloud,
  Code,
  Database,
  Gem,
  GitBranch,
  Shield,
  Square,
} from "lucide-react";

export type LegacySubject = {
  name: string;
  slug: string;
  description: string;
  accentColor: string;
  icon: LucideIcon;
  requestCount: number;
};

export const legacySubjects: LegacySubject[] = [
  {
    name: "HTML / CSS",
    slug: "html-css",
    description:
      "Intégration web, flexbox, grid, animations, responsive design...",
    accentColor: "#f97316",
    icon: Code,
    requestCount: 128,
  },
  {
    name: "JavaScript",
    slug: "javascript",
    description: "ES6+, DOM, async/await, React, Vue, Node.js...",
    accentColor: "#facc15",
    icon: Square,
    requestCount: 342,
  },
  {
    name: "Python",
    slug: "python",
    description: "Scripts, Django, Flask, data science, automatisation...",
    accentColor: "#60a5fa",
    icon: Code,
    requestCount: 219,
  },
  {
    name: "Ruby / Rails",
    slug: "ruby-rails",
    description: "Ruby, Ruby on Rails, MVC, ActiveRecord, Hotwire...",
    accentColor: "#f87171",
    icon: Gem,
    requestCount: 89,
  },
  {
    name: "Bases de données",
    slug: "bases-de-donnees",
    description: "SQL, PostgreSQL, MySQL, NoSQL, modélisation, requêtes...",
    accentColor: "#a78bfa",
    icon: Database,
    requestCount: 174,
  },
  {
    name: "Intelligence Artificielle",
    slug: "intelligence-artificielle",
    description:
      "Machine learning, deep learning, LLMs, prompt engineering...",
    accentColor: "#4ade80",
    icon: Brain,
    requestCount: 211,
  },
  {
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    description: "Docker, CI/CD, Kubernetes, AWS, déploiement, Linux...",
    accentColor: "#22d3ee",
    icon: Cloud,
    requestCount: 143,
  },
  {
    name: "Cybersécurité",
    slug: "cybersecurite",
    description: "OWASP, pentest, CTF, cryptographie, Kali Linux...",
    accentColor: "#c084fc",
    icon: Shield,
    requestCount: 97,
  },
  {
    name: "Algorithmique",
    slug: "algorithmique",
    description: "Structures de données, tri, graphes, complexité, LeetCode...",
    accentColor: "#fb923c",
    icon: GitBranch,
    requestCount: 165,
  },
];
