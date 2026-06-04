import type {
  HelpRequest,
  Resource,
  ResourceStatus,
  Response,
  Subject,
  SubjectRequest,
  SubjectRequestStatus,
  SubjectSummary,
} from "@allaboard/types";
import type {
  helpRequests,
  resources,
  responses,
  subjectRequests,
  subjects,
} from "../db/schema.js";

type HelpRequestRow = typeof helpRequests.$inferSelect;
type ResponseRow = typeof responses.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;

export function rowToSubjectSummary(row: SubjectRow): SubjectSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    accentColor: row.accentColor,
  };
}

export function rowToSubject(row: SubjectRow): Subject {
  return {
    ...rowToSubjectSummary(row),
    postsCount: row.postsCount,
    ...(row.description ? { description: row.description } : {}),
  };
}

export function rowToHelpRequest(
  row: HelpRequestRow,
  subject?: SubjectRow | null,
): HelpRequest {
  const tags = row.tags?.length ? row.tags : undefined;
  const item: HelpRequest = {
    id: row.id,
    title: row.title,
    authorId: row.authorId,
    createdAt: row.createdAt.toISOString(),
    ...(tags ? { tags } : {}),
  };

  if (row.body.trim()) item.body = row.body;
  if (row.codeSnippet) item.codeSnippet = row.codeSnippet;
  if (row.codeLanguage && row.codeLanguage !== "plaintext") {
    item.codeLanguage = row.codeLanguage;
  }
  if (row.urgent) item.urgent = true;
  if (row.status !== "open") item.status = row.status;
  if (row.mentorHelpRequested) item.mentorHelpRequested = true;
  if (row.subjectId) item.subjectId = row.subjectId;
  if (subject) item.subject = rowToSubjectSummary(subject);
  if (row.educationLevel) item.educationLevel = row.educationLevel;
  if (row.aiSummary) item.aiSummary = row.aiSummary;
  if (row.likesCount > 0) item.likesCount = row.likesCount;
  if (row.responsesCount > 0) item.responsesCount = row.responsesCount;
  if (row.bookmarksCount > 0) item.bookmarksCount = row.bookmarksCount;
  if (row.updatedAt.getTime() !== row.createdAt.getTime()) {
    item.updatedAt = row.updatedAt.toISOString();
  }

  return item;
}

type ResourceRow = typeof resources.$inferSelect;
type SubjectRequestRow = typeof subjectRequests.$inferSelect;

export function rowToResource(
  row: ResourceRow,
  subject?: SubjectRow | null,
  authorEmail?: string,
  tags: string[] = [],
): Resource {
  const item: Resource = {
    id: row.id,
    title: row.title,
    body: row.body,
    authorId: authorEmail ?? row.userId,
    status: row.status as ResourceStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
  if (row.subjectId) item.subjectId = row.subjectId;
  if (subject) item.subject = rowToSubjectSummary(subject);
  if (tags.length > 0) item.tags = tags;
  return item;
}

export function rowToSubjectRequest(row: SubjectRequestRow): SubjectRequest {
  const item: SubjectRequest = {
    id: row.id,
    name: row.name,
    status: row.status as SubjectRequestStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
  if (row.description?.trim()) item.description = row.description.trim();
  return item;
}

export function rowToResponse(row: ResponseRow): Response {
  const item: Response = {
    id: row.id,
    helpRequestId: row.helpRequestId,
    body: row.body,
    authorId: row.authorId,
    createdAt: row.createdAt.toISOString(),
  };
  if (row.codeSnippet) item.codeSnippet = row.codeSnippet;
  if (row.codeLanguage) item.codeLanguage = row.codeLanguage;
  return item;
}
