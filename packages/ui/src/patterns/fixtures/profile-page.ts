import type {
  ProfileActivityPost,
  ProfileActivityReply,
  ProfileIdentityView,
  ProfilePageLabels,
  ProfileStatsView,
  ProfileSubjectChip,
} from "../profile-types";
import type { ProfileAvatarUploadLabels } from "../profile-avatar-upload";

export const profileAvatarUploadLabelsFr: ProfileAvatarUploadLabels = {
  hint: "JPG, PNG ou WebP — 5 Mo max. Recadre en carré avant envoi.",
  chooseLabel: "Choisir une photo",
  changeLabel: "Changer la photo",
  removeLabel: "Supprimer la photo",
  cropTitle: "Recadrer la photo",
  cropConfirm: "Valider",
  cropCancel: "Annuler",
  uploadingLabel: "Envoi en cours…",
  fileTooLargeError: "Fichier trop volumineux (5 Mo max).",
  invalidTypeError: "Format non pris en charge. Utilise JPG, PNG ou WebP.",
};

export const profilePageLabelsFr: ProfilePageLabels = {
  aboutTitle: "À propos",
  aboutPlaceholder: "Présente-toi en quelques lignes…",
  aboutSave: "Enregistrer la bio",
  avatarTitle: "Photo de profil",
  avatarPlaceholder: "",
  avatarHint: profileAvatarUploadLabelsFr.hint,
  avatarSave: "",
  levelPrefix: "Niveau :",
  statsPosts: "Demandes publiées",
  statsReplies: "Réponses données",
  statsRating: "Note communauté",
  tabPosts: "Mes demandes",
  tabReplies: "Mes réponses",
  postsEmpty: "Tu n'as pas encore publié de demande d'aide.",
  repliesEmpty: "Tu n'as pas encore répondu à une demande.",
  replyOnPrefix: "Sur :",
  publishedPrefix: "publiée",
  subjectsTitle: "Matières suivies",
  subjectsEmpty: "Aucune matière associée pour le moment.",
  subjectsCta: "Explorer les matières",
  subjectsSave: "Enregistrer les matières",
  subjectsHint: "Sélectionne les matières que tu suis ou que tu maîtrises.",
  accountTitle: "Compte & notifications",
  emailLabel: "Email",
  cguLabel: "CGU acceptées",
  notifyCommentLabel: "M'alerter des nouveaux commentaires",
  notifyMessageLabel: "M'alerter des nouveaux messages",
  accountSave: "Enregistrer les préférences",
  editProfile: "Modifier le profil",
  roleStudent: "Étudiant",
  roleMentor: "Mentor",
  roleAdmin: "Admin",
  newRequestCta: "Nouvelle demande",
};

export const profilePageLabelsEn: ProfilePageLabels = {
  aboutTitle: "About",
  aboutPlaceholder: "Introduce yourself in a few lines…",
  aboutSave: "Save bio",
  avatarTitle: "Profile photo",
  avatarPlaceholder: "",
  avatarHint: "JPG, PNG or WebP — 5 MB max. Crop to a square before upload.",
  avatarSave: "",
  levelPrefix: "Level:",
  statsPosts: "Published requests",
  statsReplies: "Replies given",
  statsRating: "Community rating",
  tabPosts: "My requests",
  tabReplies: "My replies",
  postsEmpty: "You have not published any help requests yet.",
  repliesEmpty: "You have not replied to any requests yet.",
  replyOnPrefix: "On:",
  publishedPrefix: "published",
  subjectsTitle: "Subjects in progress",
  subjectsEmpty: "No subjects linked to your profile yet.",
  subjectsCta: "Explore subjects",
  subjectsSave: "Save subjects",
  subjectsHint: "Select the subjects you follow or teach.",
  accountTitle: "Account & notifications",
  emailLabel: "Email",
  cguLabel: "Terms accepted",
  notifyCommentLabel: "Notify me about new comments",
  notifyMessageLabel: "Notify me about new messages",
  accountSave: "Save preferences",
  editProfile: "Edit profile",
  roleStudent: "Student",
  roleMentor: "Mentor",
  roleAdmin: "Admin",
  newRequestCta: "New request",
};

export const profilePageIdentityFixtureFr: ProfileIdentityView = {
  name: "Inès Martin",
  initials: "IM",
  headline: "Étudiante data & SQL, curieuse de Python",
  educationLevel: "Licence MIASHS",
  bio: "Je partage surtout des retours SQL et des bonnes pratiques Python.",
  role: "student",
  memberSinceLabel: "Membre depuis juin 2026",
};

export const profilePageStatsFixture: ProfileStatsView = {
  postsCount: 7,
  responsesCount: 19,
  ratingLabel: "4.6",
};

export const profilePageSubjectsFixture: ProfileSubjectChip[] = [
  { id: "js", name: "JavaScript", accentColor: "#f59e0b" },
  { id: "sql", name: "SQL", accentColor: "#6366f1" },
  { id: "py", name: "Python", accentColor: "#10b981" },
];

export const profilePagePostsFixtureFr: ProfileActivityPost[] = [
  {
    id: "req-1",
    title: "Jointure SQL qui duplique mes lignes",
    excerpt:
      "Quand je fais un LEFT JOIN sur deux tables, j'obtiens deux fois plus de résultats…",
    meta: "il y a 4 jours · 3 réponses",
  },
  {
    id: "req-2",
    title: "Boucle for vs map en Python",
    excerpt: "Dans quel cas préférer une list comprehension ?",
    meta: "il y a 10 jours · 1 réponse",
  },
];

export const profilePageRepliesFixtureFr: ProfileActivityReply[] = [
  {
    id: "rep-1",
    helpRequestId: "req-9",
    postTitle: "Normaliser une table avant migration",
    body: "Commence par isoler les colonnes répétées dans une table de référence.",
    meta: "il y a 2 jours",
  },
];
