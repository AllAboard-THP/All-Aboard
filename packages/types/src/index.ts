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
    /** Éligible handoff Rubberduck (externe) — source : agent `POST /routing/evaluate` (#68). */
    rubberduckEligible?: boolean;
  };
};

/** Métadonnées quand `GET /help-requests/:id?filterByCertifications=true` (mentor JWT). */
export type CertificationFilterMeta = {
  applied: true;
  totalCount: number;
  visibleCount: number;
};

/** JSON body of `GET /help-requests/:id` from `apps/api`. */
export type HelpRequestDetailResponse = {
  item: HelpRequest;
  responses?: Response[];
  certificationFilter?: CertificationFilterMeta;
};

/** Corps JSON pour `POST /help-requests/:id/responses` (auteur = sujet JWT). */
export type CreateResponseBody = {
  body: string;
};

/** Réponse `201` création réponse. */
export type CreateResponseResponse = {
  item: Response;
};

/** Rôles MVP (claim JWT — ADR 0001 extension). */
export type UserRole = "student" | "mentor";

/** Corps JSON pour `POST /auth/login` (email préféré ; `userId` legacy dev). */
export type LoginBody = {
  email?: string;
  password: string;
  /** Alias legacy `bob` / `alice` → `*@dev.local` en dev uniquement. */
  userId?: string;
};

/** Réponse `200` de `POST /auth/login`. */
export type LoginResponse = {
  ok: true;
  userId: string;
  role: UserRole;
};

/** Réponse `GET /auth/me`. */
export type AuthMeResponse = {
  userId: string;
  role: UserRole;
};

/** Item enrichi de `GET /mentor/feed` — demande taguée + signalisation réponses. */
export type MentorFeedItem = HelpRequest & {
  responseCount: number;
  lastResponseAt: string | null;
  hasUnreadForMentor: boolean;
};

/** JSON body of `GET /mentor/feed` — demandes avec tags mentor/domaine. */
export type MentorFeedResponse = {
  items: MentorFeedItem[];
};

/** Corps `POST /routing/evaluate` (`apps/agent`, interne). */
export type AgentRoutingEvaluateBody = {
  title: string;
  tags?: string[];
  authorId?: string;
};

/** Réponse `POST /routing/evaluate` — #68 mappe `suggestRubberduckRedirect` → `hints.rubberduckEligible`. */
export type AgentRoutingEvaluateResponse = {
  suggestRubberduckRedirect: boolean;
  reason?: string;
};

/** Payload outbox `help_request.created` (bridge Intuition #67). */
export type HelpRequestCreatedOutboxPayload = {
  id: string;
  title: string;
  authorId: string;
  tags?: string[];
};

/** Événements outbox Postgres — évolution Phase 4 (ADR 0004). */
export type OutboxEvent =
  | {
      type: "help_request.created";
      payload: HelpRequestCreatedOutboxPayload;
    }
  | {
      type: "help_request.rubberduck_handoff";
      payload: { id: string; title: string };
    };
