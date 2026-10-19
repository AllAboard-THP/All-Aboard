import { getFormatter, getTranslations } from "next-intl/server";

import type { StudentDashboardFixture } from "@allaboard/ui/patterns/fixtures/student-dashboard";

import type { AppLocale } from "@/i18n/routing";
import {
  fetchAuthMe,
  fetchConversations,
  fetchFeed,
  fetchMyHelpRequests,
} from "@/lib/api-server";
import {
  mapStudentDashboardFixture,
  type StudentDashboardCopy,
} from "@/lib/map-student-dashboard";

export type LoadStudentDashboardResult =
  | { ok: true; fixture: StudentDashboardFixture }
  | { ok: false; error: string };

async function buildDashboardCopy(): Promise<StudentDashboardCopy> {
  const t = await getTranslations("studentDashboard");
  const format = await getFormatter();

  return {
    dateLabel: format.dateTime(new Date(), {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    summaryLine: (activeRequests, unreadMessages) => {
      const parts: string[] = [];
      if (activeRequests > 0) {
        parts.push(
          t("summary.activeRequests", { count: activeRequests }),
        );
      }
      if (unreadMessages > 0) {
        parts.push(
          t("summary.unreadMessages", { count: unreadMessages }),
        );
      }
      return parts.join(" · ");
    },
    todoReplies: (count) => t("inbox.todoReplies", { count }),
    todoUnread: t("inbox.todoUnread"),
    messageFrom: (name) => t("inbox.messageFrom", { name }),
    activityReply: (title) => t("activity.replyOn", { title }),
  };
}

export async function loadStudentDashboard(
  accessToken: string,
  locale: AppLocale,
): Promise<LoadStudentDashboardResult> {
  const copy = await buildDashboardCopy();

  const [meResult, myRequestsResult, conversationsResult, feedResult] =
    await Promise.all([
      fetchAuthMe(accessToken),
      fetchMyHelpRequests(accessToken),
      fetchConversations(accessToken),
      fetchFeed({ page: 1, limit: 5 }),
    ]);

  if (!meResult.ok) {
    return { ok: false, error: meResult.error };
  }

  const myRequests = myRequestsResult.ok ? myRequestsResult.data.items : [];
  const conversations = conversationsResult.ok ? conversationsResult.data.items : [];
  const feedItems = feedResult.ok ? feedResult.data.items : [];

  if (!myRequestsResult.ok && myRequestsResult.error !== "unauthorized") {
    return { ok: false, error: myRequestsResult.error };
  }
  if (!conversationsResult.ok && conversationsResult.error !== "unauthorized") {
    return { ok: false, error: conversationsResult.error };
  }
  if (!feedResult.ok) {
    return { ok: false, error: feedResult.error };
  }

  const fixture = mapStudentDashboardFixture({
    me: meResult.data,
    myRequests,
    conversations,
    feedItems,
    locale,
    copy,
  });

  return { ok: true, fixture };
}
