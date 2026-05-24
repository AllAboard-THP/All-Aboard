export type User = {
  id: string;
  name: string;
};

export type HelpRequest = {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
  /** Tags mentor / domaine (MOC). Absent ou vide si non utilisé. */
  tags?: string[];
};

/** JSON body of `GET /feed` from `apps/api`. */
export type FeedResponse = {
  items: HelpRequest[];
};

export type Response = {
  id: string;
  helpRequestId: string;
  body: string;
  authorId: string;
};

/** Corps JSON pour `POST /help-requests` (auteur = sujet JWT, voir ADR 0001). */
export type CreateHelpRequestBody = {
  title: string;
  tags?: string[];
};

/** Réponse `201` création demande (+ indices stub MOC). */
export type CreateHelpRequestResponse = {
  item: HelpRequest;
  hints?: {
    rubberduckEligible?: boolean;
  };
};

/** JSON body of `GET /help-requests/:id` from `apps/api`. */
export type HelpRequestDetailResponse = {
  item: HelpRequest;
  responses?: Response[];
};

/** Rôles MVP (claim JWT — ADR 0001 extension). */
export type UserRole = "student" | "mentor";

/** Réponse `GET /auth/me`. */
export type AuthMeResponse = {
  userId: string;
  role: UserRole;
};

/** JSON body of `GET /mentor/feed` — demandes avec tags mentor/domaine. */
export type MentorFeedResponse = {
  items: HelpRequest[];
};
