export type PostCardLabels = {
  copy: string;
  edit: string;
  delete: string;
  urgent: string;
  privateMessage: string;
  bookmarkAria: string;
  postActionsAria: string;
  replies: (count: number) => string;
};

export const postCardLabelsFr: PostCardLabels = {
  copy: "Copier",
  edit: "Modifier",
  delete: "Supprimer",
  urgent: "Urgent",
  privateMessage: "Message privé",
  bookmarkAria: "Sauvegarder",
  postActionsAria: "Actions du post",
  replies: (count) =>
    count > 1 ? `${count} réponses` : `${count} réponse`,
};

export const postCardLabelsEn: PostCardLabels = {
  copy: "Copy",
  edit: "Edit",
  delete: "Delete",
  urgent: "Urgent",
  privateMessage: "Private message",
  bookmarkAria: "Bookmark",
  postActionsAria: "Post actions",
  replies: (count) => (count === 1 ? `${count} reply` : `${count} replies`),
};

export type PostCardFixture = {
  authorName: string;
  authorInitials: string;
  postedAt: string;
  educationLevel: string;
  title: string;
  body: string;
  subjectName: string;
  hashtags: string[];
  codeComment: string;
};

export const postCardFixtureFr: PostCardFixture = {
  authorName: "Camille R.",
  authorInitials: "CR",
  postedAt: "18/05/2026",
  educationLevel: "BTS SIO",
  title: "Problème avec React useEffect et boucle infinie",
  body: "Mon composant re-render en boucle à cause de useEffect. Je comprends pas pourquoi mon state se met à jour sans arrêt alors que je n'ai rien changé dans les dépendances.",
  subjectName: "JavaScript",
  hashtags: ["React", "Hooks", "useEffect"],
  codeComment: "// data change à chaque render !",
};

export const postCardFixtureEn: PostCardFixture = {
  authorName: "Camille R.",
  authorInitials: "CR",
  postedAt: "05/18/2026",
  educationLevel: "BTS SIO",
  title: "React useEffect infinite loop issue",
  body: "My component re-renders in a loop because of useEffect. I don't understand why my state keeps updating even though I didn't change the dependencies.",
  subjectName: "JavaScript",
  hashtags: ["React", "Hooks", "useEffect"],
  codeComment: "// data changes on every render!",
};
