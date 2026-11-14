import { and, count, eq, inArray, sql } from "drizzle-orm";
import type { AppDatabase } from "./client.js";
import {
  bookmarks,
  conversationParticipants,
  conversations,
  denylistPatterns,
  helpRequests,
  likes,
  mentorSubjects,
  messages,
  resourceTags,
  resources,
  responses,
  subjectRequests,
  subjects,
  users,
} from "./schema.js";
import { directKeyFor } from "../services/conversations.js";
import {
  demoBookmarks,
  demoConversations,
  demoDenylistPatterns,
  demoHelpRequests,
  demoLikes,
  demoMentorSubjectLinks,
  demoResources,
  demoResponses,
  demoSubjectRequests,
  type DemoHelpRequestSpec,
} from "./seed-demo-data.js";

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function loadUserIdByEmail(
  db: AppDatabase,
  email: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function loadSubjectIdBySlug(
  db: AppDatabase,
  slug: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.slug, slug))
    .limit(1);
  return rows[0]?.id ?? null;
}

async function upsertHelpRequest(
  db: AppDatabase,
  spec: DemoHelpRequestSpec,
  authorId: string,
  subjectId: string | null,
): Promise<void> {
  const createdAt = hoursAgo(spec.hoursAgo);
  const values = {
    id: spec.id,
    title: spec.title,
    body: spec.body,
    authorId,
    tags: spec.tags,
    codeSnippet: spec.codeSnippet ?? null,
    codeLanguage: spec.codeLanguage ?? "plaintext",
    urgent: spec.urgent ?? false,
    status: spec.status ?? ("open" as const),
    mentorHelpRequested: spec.mentorHelpRequested ?? false,
    subjectId,
    educationLevel: spec.educationLevel ?? null,
    aiSummary: spec.aiSummary ?? null,
    flaggedForModeration: spec.flaggedForModeration ?? false,
    createdAt,
    updatedAt: createdAt,
  };

  const existing = await db
    .select({ id: helpRequests.id })
    .from(helpRequests)
    .where(eq(helpRequests.id, spec.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(helpRequests)
      .set({
        title: values.title,
        body: values.body,
        tags: values.tags,
        codeSnippet: values.codeSnippet,
        codeLanguage: values.codeLanguage,
        urgent: values.urgent,
        status: values.status,
        mentorHelpRequested: values.mentorHelpRequested,
        subjectId: values.subjectId,
        educationLevel: values.educationLevel,
        aiSummary: values.aiSummary,
        flaggedForModeration: values.flaggedForModeration,
        updatedAt: new Date(),
      })
      .where(eq(helpRequests.id, spec.id));
    return;
  }

  await db.insert(helpRequests).values(values);
}

async function recalculateHelpRequestCounts(db: AppDatabase): Promise<void> {
  const ids = demoHelpRequests().map((spec) => spec.id);
  if (ids.length === 0) return;

  for (const id of ids) {
    const [likesRow] = await db
      .select({ value: count() })
      .from(likes)
      .where(eq(likes.helpRequestId, id));
    const [responsesRow] = await db
      .select({ value: count() })
      .from(responses)
      .where(eq(responses.helpRequestId, id));
    const [bookmarksRow] = await db
      .select({ value: count() })
      .from(bookmarks)
      .where(eq(bookmarks.helpRequestId, id));

    await db
      .update(helpRequests)
      .set({
        likesCount: likesRow?.value ?? 0,
        responsesCount: responsesRow?.value ?? 0,
        bookmarksCount: bookmarksRow?.value ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(helpRequests.id, id));
  }
}

async function recalculateSubjectPostsCounts(db: AppDatabase): Promise<void> {
  const slugRows = await db.select({ id: subjects.id }).from(subjects);
  for (const { id } of slugRows) {
    const [row] = await db
      .select({ value: count() })
      .from(helpRequests)
      .where(
        and(eq(helpRequests.subjectId, id), sql`${helpRequests.deletedAt} IS NULL`),
      );
    await db
      .update(subjects)
      .set({ postsCount: row?.value ?? 0, updatedAt: new Date() })
      .where(eq(subjects.id, id));
  }
}

export async function seedMentorSubjects(
  db: AppDatabase,
  links: ReturnType<typeof demoMentorSubjectLinks>,
): Promise<void> {
  for (const link of links) {
    const mentorId = await loadUserIdByEmail(db, link.mentorEmail);
    if (!mentorId) continue;

    for (const slug of link.subjectSlugs) {
      const subjectId = await loadSubjectIdBySlug(db, slug);
      if (!subjectId) continue;

      const existing = await db
        .select({ id: mentorSubjects.id })
        .from(mentorSubjects)
        .where(
          and(
            eq(mentorSubjects.userId, mentorId),
            eq(mentorSubjects.subjectId, subjectId),
          ),
        )
        .limit(1);
      if (existing.length > 0) continue;

      await db.insert(mentorSubjects).values({
        userId: mentorId,
        subjectId,
      });
    }
  }
}

export async function seedDemoContent(db: AppDatabase): Promise<void> {
  let helpRequestCount = 0;
  let responseCount = 0;
  let likeCount = 0;
  let bookmarkCount = 0;
  let resourceCount = 0;
  let conversationCount = 0;
  let messageCount = 0;

  for (const spec of demoHelpRequests()) {
    const authorId = await loadUserIdByEmail(db, spec.authorEmail);
    if (!authorId) continue;
    const subjectId = await loadSubjectIdBySlug(db, spec.subjectSlug);
    await upsertHelpRequest(db, spec, authorId, subjectId);
    helpRequestCount += 1;
  }

  for (const spec of demoResponses()) {
    const authorId = await loadUserIdByEmail(db, spec.authorEmail);
    if (!authorId) continue;

    const existing = await db
      .select({ id: responses.id })
      .from(responses)
      .where(eq(responses.id, spec.id))
      .limit(1);

    const createdAt = hoursAgo(spec.hoursAgo);
    if (existing.length > 0) {
      await db
        .update(responses)
        .set({
          body: spec.body,
          codeSnippet: spec.codeSnippet ?? null,
          codeLanguage: spec.codeLanguage ?? null,
          flaggedForModeration: spec.flaggedForModeration ?? false,
        })
        .where(eq(responses.id, spec.id));
    } else {
      await db.insert(responses).values({
        id: spec.id,
        helpRequestId: spec.helpRequestId,
        body: spec.body,
        authorId,
        codeSnippet: spec.codeSnippet ?? null,
        codeLanguage: spec.codeLanguage ?? null,
        flaggedForModeration: spec.flaggedForModeration ?? false,
        createdAt,
      });
      responseCount += 1;
    }
  }

  for (const spec of demoLikes()) {
    const userId = await loadUserIdByEmail(db, spec.userEmail);
    if (!userId) continue;

    const existing = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.helpRequestId, spec.helpRequestId),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;

    await db.insert(likes).values({
      userId,
      helpRequestId: spec.helpRequestId,
    });
    likeCount += 1;
  }

  for (const spec of demoBookmarks()) {
    const userId = await loadUserIdByEmail(db, spec.userEmail);
    if (!userId) continue;

    const existing = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.helpRequestId, spec.helpRequestId),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;

    await db.insert(bookmarks).values({
      userId,
      helpRequestId: spec.helpRequestId,
    });
    bookmarkCount += 1;
  }

  await recalculateHelpRequestCounts(db);

  for (const spec of demoResources()) {
    const userId = await loadUserIdByEmail(db, spec.authorEmail);
    if (!userId) continue;
    const subjectId = await loadSubjectIdBySlug(db, spec.subjectSlug);

    const existing = await db
      .select({ id: resources.id })
      .from(resources)
      .where(eq(resources.id, spec.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(resources)
        .set({
          title: spec.title,
          body: spec.body,
          status: spec.status,
          subjectId,
          updatedAt: new Date(),
        })
        .where(eq(resources.id, spec.id));
    } else {
      await db.insert(resources).values({
        id: spec.id,
        title: spec.title,
        body: spec.body,
        userId,
        subjectId,
        status: spec.status,
      });
      resourceCount += 1;
    }

    const existingTags = await db
      .select({ tag: resourceTags.tag })
      .from(resourceTags)
      .where(eq(resourceTags.resourceId, spec.id));
    const tagSet = new Set(existingTags.map((row) => row.tag));
    for (const tag of spec.tags) {
      if (tagSet.has(tag)) continue;
      await db.insert(resourceTags).values({ resourceId: spec.id, tag });
    }
  }

  for (const spec of demoSubjectRequests()) {
    const userId = await loadUserIdByEmail(db, spec.authorEmail);
    if (!userId) continue;

    const existing = await db
      .select({ id: subjectRequests.id })
      .from(subjectRequests)
      .where(eq(subjectRequests.id, spec.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(subjectRequests)
        .set({
          name: spec.name,
          description: spec.description ?? null,
          status: spec.status,
          updatedAt: new Date(),
        })
        .where(eq(subjectRequests.id, spec.id));
    } else {
      await db.insert(subjectRequests).values({
        id: spec.id,
        userId,
        name: spec.name,
        description: spec.description ?? null,
        status: spec.status,
      });
    }
  }

  for (const spec of demoDenylistPatterns()) {
    const existing = await db
      .select({ id: denylistPatterns.id })
      .from(denylistPatterns)
      .where(eq(denylistPatterns.id, spec.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(denylistPatterns)
        .set({
          label: spec.label,
          pattern: spec.pattern,
          active: spec.active ?? true,
          updatedAt: new Date(),
        })
        .where(eq(denylistPatterns.id, spec.id));
    } else {
      await db.insert(denylistPatterns).values({
        id: spec.id,
        label: spec.label,
        pattern: spec.pattern,
        active: spec.active ?? true,
      });
    }
  }

  for (const spec of demoConversations()) {
    const participantIds: string[] = [];
    for (const email of spec.participantEmails) {
      const id = await loadUserIdByEmail(db, email);
      if (!id) {
        participantIds.length = 0;
        break;
      }
      participantIds.push(id);
    }
    if (participantIds.length !== 2) continue;

    const [userAId, userBId] = participantIds as [string, string];
    const directKey = directKeyFor(userAId, userBId);

    let conversationId: string | null = null;
    const existingConv = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.directKey, directKey))
      .limit(1);

    if (existingConv[0]) {
      conversationId = existingConv[0].id;
    } else {
      const inserted = await db
        .insert(conversations)
        .values({
          directKey,
          topic: spec.topic ?? null,
        })
        .returning({ id: conversations.id });
      conversationId = inserted[0]?.id ?? null;
      conversationCount += 1;
    }
    if (!conversationId) continue;

    for (const userId of participantIds) {
      const existingParticipant = await db
        .select({ id: conversationParticipants.id })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, userId),
          ),
        )
        .limit(1);
      if (existingParticipant.length > 0) continue;
      await db.insert(conversationParticipants).values({
        conversationId,
        userId,
      });
    }

    for (const msg of spec.messages) {
      const authorId = await loadUserIdByEmail(db, msg.authorEmail);
      if (!authorId) continue;

      const existingMsg = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.id, msg.id))
        .limit(1);

      const createdAt = hoursAgo(msg.hoursAgo);
      if (existingMsg.length > 0) {
        await db
          .update(messages)
          .set({ body: msg.body, updatedAt: new Date() })
          .where(eq(messages.id, msg.id));
      } else {
        await db.insert(messages).values({
          id: msg.id,
          conversationId,
          userId: authorId,
          body: msg.body,
          createdAt,
          updatedAt: createdAt,
        });
        messageCount += 1;
      }
    }
  }

  await recalculateSubjectPostsCounts(db);

  console.log(
    `api: demo seed — ${helpRequestCount} help request(s), ${responseCount} new response(s), ${likeCount} like(s), ${bookmarkCount} bookmark(s), ${resourceCount} resource(s), ${conversationCount} conversation(s), ${messageCount} message(s)`,
  );
}

/** Remove demo help requests (and cascaded responses/likes/bookmarks) for a clean re-seed. */
export async function clearDemoHelpRequests(db: AppDatabase): Promise<void> {
  const ids = demoHelpRequests().map((spec) => spec.id);
  if (ids.length === 0) return;
  await db.delete(helpRequests).where(inArray(helpRequests.id, ids));
  await recalculateSubjectPostsCounts(db);
}
