export type AdminUserRow = {
  id: string;
  name: string;
  initials: string;
  email: string;
  postsCount: number;
  commentsCount: number;
  role: "admin" | "student" | "mentor";
  isMentor: boolean;
  createdAt: string;
};

export const legacyAdminUsers: AdminUserRow[] = [
  {
    id: "1",
    name: "Admin AllAboard",
    initials: "AA",
    email: "",
    postsCount: 0,
    commentsCount: 0,
    role: "admin",
    isMentor: false,
    createdAt: "il y a 8 mois",
  },
  {
    id: "2",
    name: "Inès P.",
    initials: "IP",
    email: "",
    postsCount: 7,
    commentsCount: 19,
    role: "student",
    isMentor: true,
    createdAt: "il y a 4 mois",
  },
  {
    id: "3",
    name: "Karim N.",
    initials: "KN",
    email: "",
    postsCount: 9,
    commentsCount: 22,
    role: "student",
    isMentor: false,
    createdAt: "il y a 6 semaines",
  },
  {
    id: "4",
    name: "Mehdi S.",
    initials: "MS",
    email: "",
    postsCount: 4,
    commentsCount: 11,
    role: "student",
    isMentor: false,
    createdAt: "il y a 3 semaines",
  },
];

export const legacyAdminUsersEn: AdminUserRow[] = [
  { ...legacyAdminUsers[0], createdAt: "8 months ago" },
  { ...legacyAdminUsers[1], createdAt: "4 months ago" },
  { ...legacyAdminUsers[2], createdAt: "6 weeks ago" },
  { ...legacyAdminUsers[3], createdAt: "3 weeks ago" },
];
