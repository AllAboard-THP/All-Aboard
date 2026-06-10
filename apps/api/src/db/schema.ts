import {
  boolean,
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
  /** Null for OAuth-only accounts (ADR 0006). */
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
  /** Set when the Intuition bridge has published (or stub-acknowledged) this request. */
  intuitionPublishedAt: timestamp("intuition_published_at", {
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
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
