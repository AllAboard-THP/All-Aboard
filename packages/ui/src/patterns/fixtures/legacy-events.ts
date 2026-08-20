export type LegacyEvent = {
  id: string;
  dateDay: string;
  dateMonth: string;
  title: string;
  eventType: string;
  category: string;
  online?: boolean;
  description: string;
  location?: string;
  organizer?: string;
  externalUrl?: string;
};

export const legacyEvents: LegacyEvent[] = [
  {
    id: "1",
    dateDay: "12",
    dateMonth: "JUN",
    title: "Hackathon AllAboard — Édition Été",
    eventType: "Hackathon",
    category: "Général",
    online: true,
    description:
      "48 h pour prototyper une solution d'entraide étudiante avec mentors et jury produit.",
    location: "En ligne",
    organizer: "AllAboard",
    externalUrl: "#",
  },
  {
    id: "2",
    dateDay: "28",
    dateMonth: "JUN",
    title: "Portes ouvertes — Campus Numérique",
    eventType: "Portes ouvertes",
    category: "Informatique",
    description:
      "Découvrez les parcours dev, data et cybersécurité avec des ateliers guidés.",
    location: "Paris 13e",
    organizer: "Campus Numérique",
    externalUrl: "#",
  },
  {
    id: "3",
    dateDay: "05",
    dateMonth: "JUL",
    title: "Forum métiers du numérique",
    eventType: "Conférence",
    category: "Général",
    online: true,
    description:
      "Tables rondes avec alumni, recruteurs et étudiants sur les métiers tech.",
    location: "En ligne",
    organizer: "Campus Numérique",
    externalUrl: "#",
  },
];

export const legacyEventsEn: LegacyEvent[] = [
  {
    id: "1",
    dateDay: "12",
    dateMonth: "JUN",
    title: "AllAboard Hackathon — Summer Edition",
    eventType: "Hackathon",
    category: "General",
    online: true,
    description:
      "48 hours to prototype a peer-help solution with mentors and a product jury.",
    location: "Online",
    organizer: "AllAboard",
    externalUrl: "#",
  },
  {
    id: "2",
    dateDay: "28",
    dateMonth: "JUN",
    title: "Open day — Digital Campus",
    eventType: "Open day",
    category: "Computer science",
    description:
      "Explore dev, data and cybersecurity tracks with guided workshops.",
    location: "Paris 13th",
    organizer: "Digital Campus",
    externalUrl: "#",
  },
  {
    id: "3",
    dateDay: "05",
    dateMonth: "JUL",
    title: "Digital careers forum",
    eventType: "Conference",
    category: "General",
    online: true,
    description:
      "Panel discussions with alumni, recruiters and students about tech careers.",
    location: "Online",
    organizer: "Campus Numérique",
    externalUrl: "#",
  },
];
