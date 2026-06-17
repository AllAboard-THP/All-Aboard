export type User = {
  id: string;
  name: string;
};

export type HelpRequestStatus = "open" | "resolved";

export type SubjectSummary = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  accentColor: string;
};

export type Subject = SubjectSummary & {
  postsCount: number;
  description?: string;
};

export type HelpRequest = {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
  /** Tags mentor / domaine (MOC). Absent ou vide si non utilisé. */
  tags?: string[];
  /** Corps de la demande (Rails post body). */
  body?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  urgent?: boolean;
  status?: HelpRequestStatus;
  mentorHelpRequested?: boolean;
  subjectId?: string;
  subject?: SubjectSummary;
  educationLevel?: string;
  aiSummary?: string;
  likesCount?: number;
  responsesCount?: number;
  bookmarksCount?: number;
  updatedAt?: string;
  /** Masqué du fil public tant que modération en attente. */
  flaggedForModeration?: boolean;
  /** Soft delete — visible pour l'auteur uniquement. */
  deletedAt?: string;
};

export type FeedPagination = {
  page: number;
  limit: number;
  total: number;
};

export type FeedWidgets = {
  unanswered?: HelpRequest[];
};

/** JSON body of `GET /feed` from `apps/api`. */
export type FeedResponse = {
  items: HelpRequest[];
  pagination?: FeedPagination;
  widgets?: FeedWidgets;
};

export type SubjectsResponse = {
  items: Subject[];
};

export type SubjectDetailResponse = {
  item: Subject;
};

export type Response = {
  id: string;
  helpRequestId: string;
  body: string;
  authorId: string;
  createdAt?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  flaggedForModeration?: boolean;
};

/** Corps JSON pour `POST /help-requests` (auteur = sujet JWT, voir ADR 0001). */
export type CreateHelpRequestBody = {
  title: string;
  tags?: string[];
  body?: string;
  codeSnippet?: string;
  codeLanguage?: string;
  subjectId?: string;
  urgent?: boolean;
  educationLevel?: string;
};

/** Corps JSON pour `PATCH /help-requests/:id`. */
export type UpdateHelpRequestBody = {
  title?: string;
  body?: string;
  codeSnippet?: string | null;
  codeLanguage?: string;
  tags?: string[];
  subjectId?: string | null;
  urgent?: boolean;
  status?: HelpRequestStatus;
  educationLevel?: string;
};

/** Réponse `201` création demande (+ indices stub MOC). */
export type CreateHelpRequestResponse = {
  item: HelpRequest;
  hints?: {
    /** Éligible handoff Rubberduck (externe) — source : agent `POST /routing/evaluate` (#68). */
    rubberduckEligible?: boolean;
  };
};

/** Réponse `200`/`201` mise à jour demande. */
export type UpdateHelpRequestResponse = {
  item: HelpRequest;
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
  codeSnippet?: string;
  codeLanguage?: string;
};

/** Réponse `201` création réponse. */
export type CreateResponseResponse = {
  item: Response;
};

/** Corps JSON pour `PATCH /help-requests/:id/responses/:responseId`. */
export type UpdateResponseBody = {
  body?: string;
  codeSnippet?: string | null;
  codeLanguage?: string;
};

/** Réponse `200` mise à jour réponse. */
export type UpdateResponseResponse = {
  item: Response;
};

/** Réponse toggle like (Rails posts#likes). */
export type ToggleLikeResponse = {
  liked: boolean;
  likesCount: number;
  item?: HelpRequest;
};

/** Réponse toggle bookmark. */
export type ToggleBookmarkResponse = {
  bookmarked: boolean;
  bookmarksCount: number;
  item?: HelpRequest;
};

/** Listes scopées utilisateur (`GET /me/help-requests`, `GET /me/bookmarks`). */
export type MyHelpRequestsResponse = {
  items: HelpRequest[];
};

/** Rôles MVP (claim JWT — ADR 0001 extension). */
export type UserRole = "student" | "mentor" | "admin";

/** Profil utilisateur (privé — `GET /auth/me`, `PATCH /users/me`). */
export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  educationLevel?: string;
  cguAcceptedAt?: string;
  notifyOnComment?: boolean;
  notifyOnMessage?: boolean;
  certificationTags?: string[];
  competenceSubjects?: SubjectSummary[];
  createdAt: string;
  updatedAt: string;
};

/** Profil public (`GET /users/:id`). */
export type UserPublicProfile = {
  id: string;
  role: UserRole;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  educationLevel?: string;
  competenceSubjects?: SubjectSummary[];
  stats: {
    postsCount: number;
    responsesCount: number;
  };
};

export type UserStats = UserPublicProfile["stats"];

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

/** Corps JSON pour `POST /auth/register`. */
export type RegisterBody = {
  email: string;
  password: string;
  passwordConfirmation?: string;
  fullName: string;
  educationLevel?: string;
  headline?: string;
  acceptCgu: true;
};

/** Réponse `201` / `200` de `POST /auth/register`. */
export type RegisterResponse = {
  ok: true;
  userId: string;
  role: UserRole;
};

/** Corps JSON pour `POST /auth/passkey/register/options`. */
export type PasskeyRegisterOptionsBody = {
  fullName: string;
  email?: string;
  acceptCgu?: true;
};

/** Réponse `POST /auth/passkey/register/options`. */
export type PasskeyRegisterOptionsResponse = {
  options: unknown;
};

/** Réponse `POST /auth/passkey/register/verify`. */
export type PasskeyRegisterVerifyResponse = {
  ok: true;
  verified: true;
  userId: string;
  role: UserRole;
};

/** Réponse `POST /auth/passkey/login/options`. */
export type PasskeyLoginOptionsResponse = {
  options: unknown;
};

/** Réponse `POST /auth/passkey/login/verify`. */
export type PasskeyLoginVerifyResponse = {
  ok: true;
  verified: true;
  userId: string;
  role: UserRole;
};

/** Entrée passkey dans `GET /auth/passkey/credentials`. */
export type PasskeyCredentialSummary = {
  id: string;
  credentialId: string;
  deviceType?: string;
  backedUp: boolean;
  transports?: string[];
  createdAt: string;
  lastUsedAt?: string;
};

/** Réponse `GET /auth/passkey/credentials`. */
export type PasskeyCredentialListResponse = {
  items: PasskeyCredentialSummary[];
};

/** Réponse `POST /auth/logout`. */
export type LogoutResponse = {
  ok: true;
};

/** Réponse `GET /auth/me`. */
export type AuthMeResponse = {
  userId: string;
  role: UserRole;
  displayName?: string;
  fullName?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  educationLevel?: string;
  cguAcceptedAt?: string;
  notifyOnComment?: boolean;
  notifyOnMessage?: boolean;
  certificationTags?: string[];
  competenceSubjects?: SubjectSummary[];
};

/** Corps JSON pour `PATCH /users/me`. */
export type UpdateUserMeBody = {
  fullName?: string;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  educationLevel?: string | null;
  notifyOnComment?: boolean;
  notifyOnMessage?: boolean;
  subjectIds?: string[];
  certificationTags?: string[];
};

/** Réponse `PATCH /users/me`. */
export type UpdateUserMeResponse = {
  item: UserProfile;
};

/** Réponse `POST /legal/accept`. */
export type AcceptLegalResponse = {
  ok: true;
  cguAcceptedAt: string;
};

export type PublicUserTab = "posts" | "responses";

/** Réponse `GET /users/:id` (onglet posts ou responses). */
export type PublicUserResponse = {
  profile: UserPublicProfile;
  tab: PublicUserTab;
  items: HelpRequest[] | Response[];
  pagination: FeedPagination;
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

export type ResourceStatus = "pending" | "published" | "rejected";

export type Resource = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  status: ResourceStatus;
  subjectId?: string;
  subject?: SubjectSummary;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ResourcesListResponse = {
  items: Resource[];
  pagination: FeedPagination;
};

export type ResourceDetailResponse = {
  item: Resource;
};

export type CreateResourceBody = {
  title: string;
  body: string;
  subjectId: string;
  tags?: string[];
};

export type UpdateResourceBody = {
  title?: string;
  body?: string;
  subjectId?: string | null;
  tags?: string[];
};

export type CreateResourceResponse = {
  item: Resource;
};

export type UpdateResourceResponse = {
  item: Resource;
};

export type SubjectRequestStatus = "pending" | "approved" | "rejected";

export type SubjectRequest = {
  id: string;
  name: string;
  description?: string;
  status: SubjectRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubjectRequestBody = {
  name: string;
  description?: string;
};

export type CreateSubjectRequestResponse = {
  item: SubjectRequest;
};

export type MentorDashboardStats = {
  myResourcesCount: number;
  pendingResourcesCount: number;
  helpMentorQueueCount: number;
};

export type MentorDashboardResponse = {
  stats: MentorDashboardStats;
  myResources: Resource[];
  pendingResources: Resource[];
  helpMentorQueue: HelpRequest[];
};

export type ApproveResourceResponse = {
  item: Resource;
};

export type ConversationParticipantSummary = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

/** Message temps réel / REST — aligné Rails `Message#as_chat_json`. */
export type ChatMessage = {
  id: string;
  body: string;
  userId: string;
  userName: string;
  avatarUrl?: string;
  createdAt: string;
  type: "message";
};

export type ConversationInboxItem = {
  id: string;
  topic?: string;
  updatedAt: string;
  otherParticipant: ConversationParticipantSummary;
  lastMessage?: ChatMessage;
  unreadCount: number;
};

export type ConversationSummary = {
  id: string;
  topic?: string;
  updatedAt: string;
  otherParticipant: ConversationParticipantSummary;
};

export type ConversationsListResponse = {
  items: ConversationInboxItem[];
};

export type CreateConversationBody = {
  recipientId: string;
  helpRequestId?: string;
};

export type CreateConversationResponse = {
  item: ConversationSummary;
};

export type MessagesListResponse = {
  items: ChatMessage[];
  pagination: FeedPagination;
};

export type CreateMessageBody = {
  body: string;
};

export type CreateMessageResponse = {
  item: ChatMessage;
};

export type MarkConversationReadResponse = {
  ok: true;
  lastReadAt: string;
};

/** Short-lived JWT for WebSocket handoff (BFF → browser → API WS). */
export type ConversationWsTokenResponse = {
  token: string;
  expiresIn: number;
};

export type DenylistPattern = {
  id: string;
  label: string;
  pattern: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminDashboardStats = {
  totalUsers: number;
  totalHelpRequests: number;
  flaggedCount: number;
  pendingSubjectRequests: number;
  pendingResources: number;
};

export type AdminDashboardResponse = {
  stats: AdminDashboardStats;
  recentHelpRequests: HelpRequest[];
};

export type AdminModerationFlaggedResponse = {
  item: Response;
  helpRequest?: HelpRequest;
};

export type AdminModerationResponse = {
  flaggedHelpRequests: HelpRequest[];
  flaggedResponses: AdminModerationFlaggedResponse[];
};

export type AdminDenylistPatternsResponse = {
  items: DenylistPattern[];
};

export type CreateDenylistPatternBody = {
  label: string;
  pattern: string;
  active?: boolean;
};

export type CreateDenylistPatternResponse = {
  item: DenylistPattern;
};

export type UpdateDenylistPatternResponse = {
  item: DenylistPattern;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
};

export type AdminUsersResponse = {
  items: AdminUserSummary[];
};

export type PromoteAdminBody = {
  admin: boolean;
};

export type AdminSubjectRequestItem = SubjectRequest & {
  authorId: string;
  authorEmail?: string;
  authorDisplayName?: string;
};

export type AdminSubjectRequestsResponse = {
  pending: AdminSubjectRequestItem[];
  approved: AdminSubjectRequestItem[];
  rejected: AdminSubjectRequestItem[];
};

export type UpdateAdminSubjectRequestBody = {
  status: SubjectRequestStatus;
};

export type UpdateAdminSubjectRequestResponse = {
  item: AdminSubjectRequestItem;
};

export type SuggestTagsBody = {
  title?: string;
  body?: string;
};

export type SuggestTagsResponse = {
  tags: string[];
};

/** Corps `POST /tags/suggest` (`apps/agent`, interne). */
export type AgentTagsSuggestBody = {
  title?: string;
  body?: string;
};

export type AgentTagsSuggestResponse = {
  tags: string[];
};

export type AgentSummaryGenerateBody = {
  title: string;
  body?: string;
  codeSnippet?: string;
  responses?: Array<{ authorName: string; body: string }>;
};

export type AgentSummaryGenerateResponse = {
  summary: string;
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

/** Corps `POST /moderation/evaluate` (`apps/agent`, interne). */
export type AgentModerationEvaluateBody = {
  content: string;
};

/** Réponse `POST /moderation/evaluate` — second avis Claude après hit regex/denylist. */
export type AgentModerationEvaluateResponse = {
  flagged: boolean;
};

/** Payload outbox `help_request.created` (bridge Intuition #67). */
export type HelpRequestCreatedOutboxPayload = {
  id: string;
  title: string;
  authorId: string;
  tags?: string[];
};

export type HelpRequestSummaryRequestedOutboxPayload = {
  id: string;
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
    }
  | {
      type: "help_request.summary_requested";
      payload: HelpRequestSummaryRequestedOutboxPayload;
    };
