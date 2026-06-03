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
