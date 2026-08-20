import type {
  AuthMeResponse,
  HelpRequest,
  Response,
  UserPublicProfile,
} from "@allaboard/types";
import type {
  ProfileActivityPost,
  ProfileActivityReply,
  ProfileIdentityView,
  ProfilePageLabels,
  ProfileRole,
  ProfileStatsView,
  ProfileSubjectChip,
} from "@allaboard/ui/patterns/profile-types";
import type { ProfileAvatarUploadLabels } from "@allaboard/ui/patterns/profile-avatar-upload";

import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatMemberSinceLabel(
  createdAt: string,
  locale: AppLocale,
  t: (key: string, values?: { date?: string }) => string,
): string {
  const date = new Date(createdAt).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    { month: "long", year: "numeric" },
  );
  return t("memberSince", { date });
}

export function mapAuthMeToIdentity(
  me: AuthMeResponse,
  memberSinceLabel: string,
): ProfileIdentityView {
  const name = me.fullName?.trim() || me.displayName?.trim() || me.userId;
  return {
    name,
    initials: initialsFromName(name),
    headline: me.headline?.trim() ?? "",
    educationLevel: me.educationLevel?.trim() ?? "",
    bio: me.bio?.trim() ?? "",
    role: me.role as ProfileRole,
    memberSinceLabel,
    avatarUrl: me.avatarUrl,
  };
}

export function mapPublicProfileToIdentity(
  profile: UserPublicProfile,
  memberSinceLabel?: string,
): ProfileIdentityView {
  const name = profile.displayName?.trim() || profile.id;
  return {
    name,
    initials: initialsFromName(name),
    headline: profile.headline?.trim() ?? "",
    educationLevel: profile.educationLevel?.trim() ?? "",
    bio: profile.bio?.trim() ?? "",
    role: profile.role as ProfileRole,
    memberSinceLabel,
    avatarUrl: profile.avatarUrl,
  };
}

export function mapPublicSubjects(
  profile: UserPublicProfile,
): ProfileSubjectChip[] {
  return (profile.competenceSubjects ?? []).map((subject) => ({
    id: subject.id,
    name: subject.name,
    accentColor: subject.accentColor,
  }));
}

export function roleLabelFor(
  role: ProfileRole,
  labels: Pick<ProfilePageLabels, "roleStudent" | "roleMentor" | "roleAdmin">,
): string {
  if (role === "mentor") return labels.roleMentor;
  if (role === "admin") return labels.roleAdmin;
  return labels.roleStudent;
}

export function mapStats(
  postsCount: number,
  responsesCount: number,
  ratingLabel = "—",
): ProfileStatsView {
  return { postsCount, responsesCount, ratingLabel };
}

export function mapSubjects(me: AuthMeResponse): ProfileSubjectChip[] {
  return (me.competenceSubjects ?? []).map((subject) => ({
    id: subject.id,
    name: subject.name,
    accentColor: subject.accentColor,
  }));
}

export function mapHelpRequestsToPosts(
  items: HelpRequest[],
  locale: AppLocale,
  responseCountLabel: (count: number) => string,
): ProfileActivityPost[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    excerpt: item.body?.trim() || item.aiSummary?.trim() || "—",
    meta: `${formatRelativeTime(item.createdAt, locale)} · ${responseCountLabel(item.responsesCount ?? 0)}`,
  }));
}

export function mapResponsesToReplies(
  items: Response[],
  postTitleByRequestId: Map<string, string>,
  locale: AppLocale,
): ProfileActivityReply[] {
  return items.map((item) => ({
    id: item.id,
    helpRequestId: item.helpRequestId,
    postTitle:
      postTitleByRequestId.get(item.helpRequestId) ?? item.helpRequestId,
    body: item.body,
    meta: item.createdAt
      ? formatRelativeTime(item.createdAt, locale)
      : formatDateTime(new Date().toISOString(), locale),
  }));
}

export function buildAvatarUploadLabels(
  t: (key: string) => string,
): ProfileAvatarUploadLabels {
  return {
    hint: t("avatarHint"),
    chooseLabel: t("avatarChoose"),
    changeLabel: t("avatarChange"),
    removeLabel: t("avatarRemove"),
    cropTitle: t("avatarCropTitle"),
    cropConfirm: t("avatarCropConfirm"),
    cropCancel: t("avatarCropCancel"),
    uploadingLabel: t("avatarUploading"),
    fileTooLargeError: t("avatarFileTooLargeError"),
    invalidTypeError: t("avatarInvalidTypeError"),
  };
}

export function buildProfilePageLabels(
  t: (key: string) => string,
  legacyLevelPrefix: string,
): ProfilePageLabels {
  return {
    aboutTitle: t("aboutTitle"),
    aboutPlaceholder: t("aboutPlaceholder"),
    aboutSave: t("aboutSave"),
    avatarTitle: t("avatarTitle"),
    avatarPlaceholder: "",
    avatarHint: t("avatarHint"),
    avatarSave: "",
    levelPrefix: legacyLevelPrefix,
    statsPosts: t("statsPosts"),
    statsReplies: t("statsReplies"),
    statsRating: t("statsRating"),
    tabPosts: t("tabPosts"),
    tabReplies: t("tabReplies"),
    postsEmpty: t("postsEmpty"),
    repliesEmpty: t("repliesEmpty"),
    replyOnPrefix: t("replyOnPrefix"),
    publishedPrefix: t("publishedPrefix"),
    subjectsTitle: t("subjectsTitle"),
    subjectsEmpty: t("subjectsEmpty"),
    subjectsCta: t("subjectsCta"),
    subjectsSave: t("subjectsSave"),
    subjectsHint: t("subjectsHint"),
    accountTitle: t("accountTitle"),
    emailLabel: t("emailLabel"),
    cguLabel: t("cguLabel"),
    notifyCommentLabel: t("notifyCommentLabel"),
    notifyMessageLabel: t("notifyMessageLabel"),
    accountSave: t("accountSave"),
    editProfile: t("editProfile"),
    roleStudent: t("roleStudent"),
    roleMentor: t("roleMentor"),
    roleAdmin: t("roleAdmin"),
    newRequestCta: t("newRequestCta"),
  };
}

export function buildPublicProfilePageLabels(
  t: (key: string) => string,
): ProfilePageLabels {
  return {
    aboutTitle: t("aboutTitle"),
    aboutPlaceholder: "",
    aboutSave: "",
    avatarTitle: "",
    avatarPlaceholder: "",
    avatarHint: "",
    avatarSave: "",
    levelPrefix: "",
    statsPosts: t("statsPosts"),
    statsReplies: t("statsReplies"),
    statsRating: t("statsRating"),
    tabPosts: t("tabPosts"),
    tabReplies: t("tabReplies"),
    postsEmpty: t("postsEmpty"),
    repliesEmpty: t("repliesEmpty"),
    replyOnPrefix: t("replyOnPrefix"),
    publishedPrefix: t("publishedPrefix"),
    subjectsTitle: t("subjectsTitle"),
    subjectsEmpty: t("subjectsEmpty"),
    subjectsCta: "",
    subjectsSave: "",
    subjectsHint: "",
    accountTitle: "",
    emailLabel: "",
    cguLabel: "",
    notifyCommentLabel: "",
    notifyMessageLabel: "",
    accountSave: "",
    editProfile: "",
    roleStudent: t("roleStudent"),
    roleMentor: t("roleMentor"),
    roleAdmin: t("roleAdmin"),
    newRequestCta: "",
  };
}
