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

export const userRoleEnum = pgEnum("user_role", ["student", "mentor"]);

export const helpRequestStatusEnum = pgEnum("help_request_status", [
  "open",
  "resolved",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  /** Tags domaine / stack pour filtrage réponses mentor (MOC étape 8). */
  certificationTags: text("certification_tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
  createdAt: timestamp("created_at", { withTimezone: true })
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
