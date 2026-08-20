export type ProfileRole = "student" | "mentor" | "admin";

export type ProfileSubjectCatalogItem = {
  id: string;
  name: string;
  accentColor: string;
};

export type ProfileSubjectChip = {
  id: string;
  name: string;
  accentColor?: string;
};

export type ProfileActivityPost = {
  id: string;
  title: string;
  excerpt: string;
  meta: string;
};

export type ProfileActivityReply = {
  id: string;
  helpRequestId: string;
  postTitle: string;
  body: string;
  meta: string;
};

export type ProfileStatsView = {
  postsCount: number;
  responsesCount: number;
  ratingLabel: string;
};

export type ProfileIdentityView = {
  name: string;
  initials: string;
  headline: string;
  educationLevel: string;
  bio: string;
  role: ProfileRole;
  memberSinceLabel?: string;
  avatarUrl?: string;
};

export type ProfileAccountView = {
  email: string;
  cguAcceptedLabel?: string;
  notifyOnComment: boolean;
  notifyOnMessage: boolean;
};

export type ProfilePageLabels = {
  aboutTitle: string;
  aboutPlaceholder: string;
  aboutSave: string;
  avatarTitle: string;
  avatarPlaceholder: string;
  avatarHint: string;
  avatarSave: string;
  levelPrefix: string;
  statsPosts: string;
  statsReplies: string;
  statsRating: string;
  tabPosts: string;
  tabReplies: string;
  postsEmpty: string;
  repliesEmpty: string;
  replyOnPrefix: string;
  publishedPrefix: string;
  subjectsTitle: string;
  subjectsEmpty: string;
  subjectsCta: string;
  subjectsSave: string;
  subjectsHint: string;
  accountTitle: string;
  emailLabel: string;
  cguLabel: string;
  notifyCommentLabel: string;
  notifyMessageLabel: string;
  accountSave: string;
  editProfile: string;
  roleStudent: string;
  roleMentor: string;
  roleAdmin: string;
  newRequestCta: string;
};
