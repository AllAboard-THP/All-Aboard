import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "mentor",
  "admin",
]);

export const helpRequestStatusEnum = pgEnum("help_request_status", [
  "open",
  "resolved",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull(),
  fullName: text("full_name"),
  headline: text("headline"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  educationLevel: text("education_level"),
  cguAcceptedAt: timestamp("cgu_accepted_at", { withTimezone: true }),
  notifyOnComment: boolean("notify_on_comment").notNull().default(true),
  notifyOnMessage: boolean("notify_on_message").notNull().default(true),
  /** Tags domaine / stack pour filtrage réponses mentor (MOC étape 8). */
  certificationTags: text("certification_tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("oauth_accounts_provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("book"),
  accentColor: text("accent_color").notNull().default("#6366f1"),
  description: text("description"),
  postsCount: integer("posts_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mentorSubjects = pgTable(
  "mentor_subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("mentor_subjects_user_subject_unique").on(
      table.userId,
      table.subjectId,
    ),
  ],
);

export const helpRequests = pgTable("help_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  authorId: text("author_id").notNull(),
  tags: text("tags").array().notNull().default([]),
  codeSnippet: text("code_snippet"),
  codeLanguage: text("code_language").default("plaintext"),
  urgent: boolean("urgent").notNull().default(false),
  status: helpRequestStatusEnum("status").notNull().default("open"),
  mentorHelpRequested: boolean("mentor_help_requested").notNull().default(false),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  educationLevel: text("education_level"),
  aiSummary: text("ai_summary"),
  likesCount: integer("likes_count").notNull().default(0),
  responsesCount: integer("responses_count").notNull().default(0),
  bookmarksCount: integer("bookmarks_count").notNull().default(0),
  flaggedForModeration: boolean("flagged_for_moderation").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  /** Set when the Intuition outbox stub has acknowledged this request. Nothing is published on-chain. */
  intuitionStubAckedAt: timestamp("intuition_stub_acked_at", {
    withTimezone: true,
  }),
});

export const outboxEvents = pgTable(
  "outbox_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    aggregateId: uuid("aggregate_id").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("outbox_events_type_aggregate_unique").on(
      table.eventType,
      table.aggregateId,
    ),
  ],
);

export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  helpRequestId: uuid("help_request_id")
    .notNull()
    .references(() => helpRequests.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorId: text("author_id").notNull(),
  codeSnippet: text("code_snippet"),
  codeLanguage: text("code_language"),
  flaggedForModeration: boolean("flagged_for_moderation").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const denylistPatterns = pgTable("denylist_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  pattern: text("pattern").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    helpRequestId: uuid("help_request_id")
      .notNull()
      .references(() => helpRequests.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("likes_user_help_request_unique").on(
      table.userId,
      table.helpRequestId,
    ),
  ],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    helpRequestId: uuid("help_request_id")
      .notNull()
      .references(() => helpRequests.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_help_request_unique").on(
      table.userId,
      table.helpRequestId,
    ),
  ],
);

export const resourceStatusEnum = pgEnum("resource_status", [
  "pending",
  "published",
  "rejected",
]);

export const messageKindEnum = pgEnum("message_kind", [
  "text",
  "audio",
  "video",
]);

export const attachmentSourceEnum = pgEnum("attachment_source", [
  "camera",
  "screen",
  "microphone",
]);

export const subjectRequestStatusEnum = pgEnum("subject_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  status: resourceStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resourceTags = pgTable(
  "resource_tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("resource_tags_resource_tag_unique").on(
      table.resourceId,
      table.tag,
    ),
  ],
);

export const subjectRequests = pgTable("subject_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: subjectRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topic: text("topic"),
    directKey: text("direct_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("conversations_direct_key_unique").on(table.directKey),
  ],
);

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("conversation_participants_conversation_user_unique").on(
      table.conversationId,
      table.userId,
    ),
  ],
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageKind: messageKindEnum("message_kind").notNull().default("text"),
  body: text("body"),
  attachmentKey: text("attachment_key"),
  attachmentMime: text("attachment_mime"),
  attachmentSizeBytes: integer("attachment_size_bytes"),
  attachmentDurationMs: integer("attachment_duration_ms"),
  attachmentSource: attachmentSourceEnum("attachment_source"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * #197: a question pinned to a moment of a video message, optionally on a
 * rectangle of the frame (relative coordinates, 0..1). Soft delete keeps replies.
 */
export const messageAnnotations = pgTable(
  "message_annotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    atMs: integer("at_ms").notNull(),
    rectX: doublePrecision("rect_x"),
    rectY: doublePrecision("rect_y"),
    rectW: doublePrecision("rect_w"),
    rectH: doublePrecision("rect_h"),
    body: text("body").notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("message_annotations_message_at_idx").on(table.messageId, table.atMs),
    check("message_annotations_at_ms_non_negative", sql`${table.atMs} >= 0`),
    check(
      "message_annotations_rect_valid",
      sql`(${table.rectX} IS NULL AND ${table.rectY} IS NULL AND ${table.rectW} IS NULL AND ${table.rectH} IS NULL)
        OR (${table.rectX} >= 0 AND ${table.rectY} >= 0 AND ${table.rectW} > 0 AND ${table.rectH} > 0
          AND ${table.rectX} + ${table.rectW} <= 1 AND ${table.rectY} + ${table.rectH} <= 1)`,
    ),
  ],
);

export const messageAnnotationReplies = pgTable(
  "message_annotation_replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    annotationId: uuid("annotation_id")
      .notNull()
      .references(() => messageAnnotations.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("message_annotation_replies_annotation_created_idx").on(
      table.annotationId,
      table.createdAt,
    ),
  ],
);

/** Per user and video message: annotations and replies after `last_read_at` are unread. */
export const messageAnnotationReads = pgTable(
  "message_annotation_reads",
  {
    messageId: uuid("message_id")
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("message_annotation_reads_message_user_unique").on(
      table.messageId,
      table.userId,
    ),
  ],
);

export const webauthnCredentials = pgTable(
  "webauthn_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull().unique(),
    publicKey: text("public_key").notNull(),
    counter: bigint("counter", { mode: "number" }).notNull().default(0),
    transports: text("transports").array(),
    deviceType: text("device_type"),
    backedUp: boolean("backed_up").notNull().default(false),
    aaguid: text("aaguid"),
    webauthnUserId: text("webauthn_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("webauthn_credentials_user_id_idx").on(table.userId),
  ],
);

export const webauthnChallenges = pgTable("webauthn_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  challenge: text("challenge").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Skill catalogue for peer +1s (ADR 0009). `label` is frozen once created: it gives the atom bytes. */
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  active: boolean("active").notNull().default(true),
  intuitionAtomId: text("intuition_atom_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One row per peer +1 (ADR 0009 §4). On-chain fields stay null until the publisher exists. */
export const certifications = pgTable(
  "certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attesterId: uuid("attester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    claimTripleId: text("claim_triple_id"),
    attestationTripleId: text("attestation_triple_id"),
    txHash: text("tx_hash"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishError: text("publish_error"),
    publishAttempts: integer("publish_attempts").notNull().default(0),
    /** Earliest time the publisher retries after an error (ADR 0009 §5). */
    nextPublishAt: timestamp("next_publish_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("certifications_recipient_attester_skill_unique").on(
      table.recipientId,
      table.attesterId,
      table.skillId,
    ),
    index("certifications_recipient_revoked_idx").on(
      table.recipientId,
      table.revokedAt,
    ),
    index("certifications_attester_created_idx").on(
      table.attesterId,
      table.createdAt,
    ),
    check(
      "certifications_not_self",
      sql`${table.recipientId} <> ${table.attesterId}`,
    ),
  ],
);

/** Mission types (product spec `Docs/product/missions.md`, #193). */
export const missionKindEnum = pgEnum("mission_kind", [
  "personal_project",
  "freelance",
  "hackathon",
]);

export const missionStatusEnum = pgEnum("mission_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const missionApplicationStatusEnum = pgEnum(
  "mission_application_status",
  ["pending", "accepted", "rejected", "withdrawn"],
);

/** A mission posted by a mentor (ADR 0010). Only its URL goes on-chain. */
export const missions = pgTable(
  "missions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: missionKindEnum("kind").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    githubRepoUrl: text("github_repo_url"),
    /** Free text, information only. No payment in the app. */
    compensation: text("compensation"),
    places: integer("places").notNull().default(1),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: missionStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("missions_status_created_idx").on(table.status, table.createdAt),
    index("missions_author_created_idx").on(table.authorId, table.createdAt),
    check("missions_places_positive", sql`${table.places} >= 1`),
  ],
);

export const missionSkills = pgTable(
  "mission_skills",
  {
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
  },
  (table) => [
    uniqueIndex("mission_skills_mission_skill_unique").on(
      table.missionId,
      table.skillId,
    ),
    index("mission_skills_skill_idx").on(table.skillId),
  ],
);

export const missionApplications = pgTable(
  "mission_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: missionApplicationStatusEnum("status").notNull().default("pending"),
    deliverableUrl: text("deliverable_url"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("mission_applications_mission_applicant_unique").on(
      table.missionId,
      table.applicantId,
    ),
    index("mission_applications_applicant_idx").on(table.applicantId),
  ],
);

/** One row per validated participant (ADR 0010 §1). Same publish columns as `certifications`. */
export const experienceCertifications = pgTable(
  "experience_certifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id),
    applicationId: uuid("application_id")
      .notNull()
      .unique()
      .references(() => missionApplications.id),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attesterId: uuid("attester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    claimTripleId: text("claim_triple_id"),
    attestationTripleId: text("attestation_triple_id"),
    txHash: text("tx_hash"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    publishError: text("publish_error"),
    publishAttempts: integer("publish_attempts").notNull().default(0),
    nextPublishAt: timestamp("next_publish_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("experience_certifications_mission_recipient_unique").on(
      table.missionId,
      table.recipientId,
    ),
    index("experience_certifications_recipient_revoked_idx").on(
      table.recipientId,
      table.revokedAt,
    ),
    check(
      "experience_certifications_not_self",
      sql`${table.recipientId} <> ${table.attesterId}`,
    ),
  ],
);
