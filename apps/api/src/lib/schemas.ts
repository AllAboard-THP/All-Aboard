import { z } from "zod";

export const createHelpRequestBodySchema = z.object({
  title: z.string().min(1).max(500),
  tags: z.array(z.string().max(64)).max(32).optional(),
  body: z.string().max(50_000).optional(),
  codeSnippet: z.string().max(50_000).optional(),
  codeLanguage: z.string().max(64).optional(),
  subjectId: z.string().uuid().optional(),
  urgent: z.boolean().optional(),
  educationLevel: z.string().max(64).optional(),
});

export const updateHelpRequestBodySchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    body: z.string().max(50_000).optional(),
    codeSnippet: z.string().max(50_000).nullable().optional(),
    codeLanguage: z.string().max(64).optional(),
    tags: z.array(z.string().max(64)).max(32).optional(),
    subjectId: z.string().uuid().nullable().optional(),
    urgent: z.boolean().optional(),
    status: z.enum(["open", "resolved"]).optional(),
    educationLevel: z.string().max(64).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at_least_one_field",
  });

export const createResponseBodySchema = z.object({
  body: z.string().min(1).max(10_000),
  codeSnippet: z.string().max(50_000).optional(),
  codeLanguage: z.string().max(64).optional(),
});

export const updateResponseBodySchema = z
  .object({
    body: z.string().min(1).max(10_000).optional(),
    codeSnippet: z.string().max(50_000).nullable().optional(),
    codeLanguage: z.string().max(64).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at_least_one_field",
  });

export type FeedQueryParams = {
  page: number;
  limit: number;
  offset: number;
  subjectSlug?: string;
  tag?: string;
  q?: string;
  includeWidgets: boolean;
};

export const updateUserMeBodySchema = z
  .object({
    fullName: z.string().min(1).max(200).optional(),
    headline: z.string().max(200).nullable().optional(),
    bio: z.string().max(5000).nullable().optional(),
    avatarUrl: z.string().url().max(2000).nullable().optional(),
    educationLevel: z.string().max(64).nullable().optional(),
    notifyOnComment: z.boolean().optional(),
    notifyOnMessage: z.boolean().optional(),
    subjectIds: z.array(z.string().uuid()).max(32).optional(),
    certificationTags: z.array(z.string().max(64)).max(32).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at_least_one_field",
  });

export type PublicUserTab = "posts" | "responses";

export type PublicUserQueryParams = {
  tab: PublicUserTab;
  page: number;
  limit: number;
  offset: number;
};

export const createResourceBodySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(50_000),
  subjectId: z.string().uuid(),
  tags: z.array(z.string().max(64)).max(32).optional(),
});

export const updateResourceBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().min(1).max(50_000).optional(),
    subjectId: z.string().uuid().nullable().optional(),
    tags: z.array(z.string().max(64)).max(32).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "at_least_one_field",
  });

export const createSubjectRequestBodySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(500).optional(),
});

export const createDenylistPatternBodySchema = z.object({
  label: z.string().min(1).max(120),
  pattern: z.string().min(1).max(500),
  active: z.boolean().optional(),
});

export const promoteAdminBodySchema = z.object({
  admin: z.boolean(),
});

export const adminSubjectRequestPatchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const suggestTagsBodySchema = z.object({
  title: z.string().max(500).optional(),
  body: z.string().max(50_000).optional(),
});

export const createConversationBodySchema = z.object({
  recipientId: z.string().uuid(),
  helpRequestId: z.string().uuid().optional(),
});

export const createMessageBodySchema = z.object({
  body: z.string().min(1).max(10_000),
});

export type MessagesListQueryParams = {
  page: number;
  limit: number;
  offset: number;
};

export function parseMessagesListQuery(
  query: Record<string, unknown>,
): MessagesListQueryParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(query.limit ?? "50"), 10) || 50),
  );
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export type ResourcesListQueryParams = {
  q?: string;
  page: number;
  limit: number;
  offset: number;
};

export function parseResourcesListQuery(
  query: Record<string, unknown>,
): ResourcesListQueryParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
  const q =
    typeof query.q === "string" && query.q.trim().length > 0
      ? query.q.trim()
      : undefined;
  return {
    q,
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function parsePublicUserQuery(
  query: Record<string, unknown>,
): PublicUserQueryParams {
  const tabRaw = String(query.tab ?? "posts").toLowerCase();
  const tab: PublicUserTab = tabRaw === "responses" ? "responses" : "posts";
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(query.limit ?? "20"), 10) || 20),
  );
  return {
    tab,
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function parseFeedQuery(query: Record<string, unknown>): FeedQueryParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(query.limit ?? "100"), 10) || 100),
  );
  const includeRaw = String(query.include ?? "");
  const includeWidgets =
    includeRaw === "widgets" || includeRaw.split(",").includes("widgets");

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    subjectSlug:
      typeof query.subject === "string" && query.subject.trim()
        ? query.subject.trim().toLowerCase()
        : undefined,
    tag:
      typeof query.tag === "string" && query.tag.trim()
        ? query.tag.trim().toLowerCase()
        : undefined,
    q:
      typeof query.q === "string" && query.q.trim()
        ? query.q.trim()
        : undefined,
    includeWidgets,
  };
}
