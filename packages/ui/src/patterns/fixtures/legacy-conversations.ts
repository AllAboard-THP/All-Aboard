export type LegacyConversation = {
  id: string;
  peerName: string;
  peerInitials: string;
  preview: string;
  timeAgo: string;
  online?: boolean;
  unreadCount?: number;
  active?: boolean;
};

export const legacyConversations: LegacyConversation[] = [
  {
    id: "1",
    peerName: "Sofia T.",
    peerInitials: "ST",
    preview: "Tu peux relire mon extrait SQL avant demain ?",
    timeAgo: "il y a 8 min",
    online: true,
    unreadCount: 2,
    active: true,
  },
  {
    id: "2",
    peerName: "Yann L.",
    peerInitials: "YL",
    preview: "J'ai testé ta piste sur les deps du useEffect.",
    timeAgo: "il y a 3 h",
    online: true,
  },
  {
    id: "3",
    peerName: "Emma V.",
    peerInitials: "EV",
    preview: "Commencez la conversation",
    timeAgo: "hier",
    online: false,
    unreadCount: 1,
  },
  {
    id: "4",
    peerName: "Karim N.",
    peerInitials: "KN",
    preview: "Merci pour le retour sur mon module Python.",
    timeAgo: "il y a 4 j",
    online: false,
  },
];

export const legacyConversationsEn: LegacyConversation[] = [
  {
    id: "1",
    peerName: "Sofia T.",
    peerInitials: "ST",
    preview: "Can you review my SQL snippet before tomorrow?",
    timeAgo: "8 min ago",
    online: true,
    unreadCount: 2,
    active: true,
  },
  {
    id: "2",
    peerName: "Yann L.",
    peerInitials: "YL",
    preview: "I tried your hint about the useEffect deps.",
    timeAgo: "3 h ago",
    online: true,
  },
  {
    id: "3",
    peerName: "Emma V.",
    peerInitials: "EV",
    preview: "Start the conversation",
    timeAgo: "yesterday",
    online: false,
    unreadCount: 1,
  },
  {
    id: "4",
    peerName: "Karim N.",
    peerInitials: "KN",
    preview: "Thanks for the feedback on my Python module.",
    timeAgo: "4 d ago",
    online: false,
  },
];
