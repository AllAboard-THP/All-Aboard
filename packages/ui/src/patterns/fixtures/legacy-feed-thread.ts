export type LegacyFeedComment = {
  id: string;
  authorName: string;
  authorInitials: string;
  timeAgo: string;
  body: string;
  code?: { language: string; snippet: string };
};

export type LegacyRecentlyViewedPost = {
  id: string;
  title: string;
  subjectName: string;
  accentColor: string;
  timeAgo: string;
};

export const legacyFeedThreadComments: LegacyFeedComment[] = [
  {
    id: "1",
    authorName: "Yann L.",
    authorInitials: "YL",
    timeAgo: "il y a 2 h",
    body: "Le souci vient des deps : fetchData modifie `data`, ce qui relance l'effet. Essaie `[]` pour un appel unique au montage.",
    code: {
      language: "javascript",
      snippet: "useEffect(() => {\n  fetchData();\n}, []);",
    },
  },
  {
    id: "2",
    authorName: "Inès P.",
    authorInitials: "IP",
    timeAgo: "il y a 1 h",
    body: "Si tu dois relancer quand une vraie condition change, mémorise fetchData avec useCallback et ne mets que des primitives dans les deps.",
  },
  {
    id: "3",
    authorName: "Karim N.",
    authorInitials: "KN",
    timeAgo: "il y a 45 min",
    body: "J'avais le même bug la semaine dernière — useCallback a tout débloqué pour moi aussi.",
  },
];

export const legacyFeedThreadCommentsSecondary: LegacyFeedComment[] = [
  {
    id: "1",
    authorName: "Léa M.",
    authorInitials: "LM",
    timeAgo: "il y a 3 h",
    body: "La closure « capture » count : chaque appel à inner() lit la même variable, même après le return de outer().",
  },
  {
    id: "2",
    authorName: "Hugo D.",
    authorInitials: "HD",
    timeAgo: "il y a 2 h",
    body: "Teste avec const counter = outer(); puis counter() plusieurs fois — tu verras count s'incrémenter.",
  },
];

export const legacyFeedThreadCommentsSecondaryEn: LegacyFeedComment[] = [
  {
    id: "1",
    authorName: "Léa M.",
    authorInitials: "LM",
    timeAgo: "3 h ago",
    body: "The closure \"captures\" count: each inner() call reads the same variable, even after outer returns.",
  },
  {
    id: "2",
    authorName: "Hugo D.",
    authorInitials: "HD",
    timeAgo: "2 h ago",
    body: "Try const counter = outer(); then call counter() a few times — you'll see count increment.",
  },
];

export const legacyFeedThreadCommentsEn: LegacyFeedComment[] = [
  {
    id: "1",
    authorName: "Yann L.",
    authorInitials: "YL",
    timeAgo: "2 h ago",
    body: "The issue is the deps: fetchData updates `data`, which retriggers the effect. Try `[]` for a single mount call.",
    code: {
      language: "javascript",
      snippet: "useEffect(() => {\n  fetchData();\n}, []);",
    },
  },
  {
    id: "2",
    authorName: "Inès P.",
    authorInitials: "IP",
    timeAgo: "1 h ago",
    body: "If you need to rerun when a real condition changes, memoize fetchData with useCallback and keep only primitives in deps.",
  },
  {
    id: "3",
    authorName: "Karim N.",
    authorInitials: "KN",
    timeAgo: "45 min ago",
    body: "Same bug last week for me — useCallback fixed it completely.",
  },
];
