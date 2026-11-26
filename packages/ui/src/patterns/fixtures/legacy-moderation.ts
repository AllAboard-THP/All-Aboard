export type ModerationFlaggedPost = {
  id: string;
  authorName: string;
  authorInitials: string;
  title: string;
  body: string;
  timeAgo: string;
};

export type ModerationFlaggedComment = {
  id: string;
  authorName: string;
  authorInitials: string;
  postTitle: string;
  body: string;
  timeAgo: string;
};

export type ModerationFixture = {
  flaggedPosts: ModerationFlaggedPost[];
  flaggedComments: ModerationFlaggedComment[];
};

export const legacyModeration: ModerationFixture = {
  flaggedPosts: [
    {
      id: "1",
      authorName: "Zineb H.",
      authorInitials: "ZH",
      title: "Lien externe douteux dans une ressource",
      body: "Le post contient une URL raccourcie non reconnue par la denylist automatique.",
      timeAgo: "il y a 1 h",
    },
  ],
  flaggedComments: [
    {
      id: "1",
      authorName: "Compte suspendu",
      authorInitials: "CS",
      postTitle: "Jointure SQL qui duplique mes lignes",
      body: "Commentaire signalé pour spam répétitif sur plusieurs fils.",
      timeAgo: "il y a 20 min",
    },
  ],
};

export const legacyModerationEn: ModerationFixture = {
  flaggedPosts: [
    {
      id: "1",
      authorName: "Zineb H.",
      authorInitials: "ZH",
      title: "Suspicious external link in a resource",
      body: "The post contains a shortened URL not recognized by the automatic denylist.",
      timeAgo: "1 h ago",
    },
  ],
  flaggedComments: [
    {
      id: "1",
      authorName: "Suspended account",
      authorInitials: "XS",
      postTitle: "SQL join duplicating my rows",
      body: "Comment flagged for repeated spam across several threads.",
      timeAgo: "20 min ago",
    },
  ],
};
