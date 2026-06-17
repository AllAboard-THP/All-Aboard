import type {
  AuthMeResponse,
  ConversationInboxItem,
  HelpRequest,
} from "@allaboard/types";
import type {
  DashboardActivityItem,
  DashboardTodoItem,
  StudentDashboardFixture,
} from "@allaboard/ui/patterns/fixtures/student-dashboard";

import type { AppLocale } from "@/i18n/routing";
import { formatRelativeTime } from "@/lib/format-relative-time";

export type StudentDashboardCopy = {
  dateLabel: string;
  summaryLine: (activeRequests: number, unreadMessages: number) => string;
  todoReplies: (count: number) => string;
  todoUnread: string;
  messageFrom: (name: string) => string;
  activityReply: (title: string) => string;
};

export type StudentDashboardSource = {
  me: AuthMeResponse;
  myRequests: HelpRequest[];
  conversations: ConversationInboxItem[];
  feedItems: HelpRequest[];
  locale: AppLocale;
  copy: StudentDashboardCopy;
};

const SHORTCUTS: StudentDashboardFixture["shortcuts"] = [
  { id: "subjects", href: "/explore" },
  { id: "resources", href: "/resources" },
  { id: "events", href: "/events" },
  { id: "profile", href: "/profile" },
];

function displayNameFromMe(me: AuthMeResponse): string {
  return me.fullName?.trim() || me.displayName?.trim() || me.userId;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function buildTodos(
  myRequests: HelpRequest[],
  conversations: ConversationInboxItem[],
  locale: AppLocale,
  copy: StudentDashboardCopy,
): DashboardTodoItem[] {
  const todos: DashboardTodoItem[] = [];

  const activeRequests = myRequests
    .filter((item) => (item.responsesCount ?? 0) > 0)
    .sort((a, b) => Date.parse(b.updatedAt ?? b.createdAt) - Date.parse(a.updatedAt ?? a.createdAt));

  for (const request of activeRequests.slice(0, 2)) {
    const replyCount = request.responsesCount ?? 0;
    todos.push({
      id: `request-${request.id}`,
      kind: "helpRequest",
      title: request.title,
      subtitle: copy.todoReplies(replyCount),
      href: `/requests/${request.id}`,
      timeAgo: formatRelativeTime(request.updatedAt ?? request.createdAt, locale),
    });
  }

  const unreadConversation = conversations.find((item) => item.unreadCount > 0);
  if (unreadConversation) {
    const peerName =
      unreadConversation.otherParticipant.displayName?.trim() ||
      unreadConversation.otherParticipant.id;
    todos.push({
      id: `message-${unreadConversation.id}`,
      kind: "message",
      title: copy.messageFrom(peerName),
      subtitle: copy.todoUnread,
      href: `/messages/${unreadConversation.id}`,
    });
  }

  return todos.slice(0, 3);
}

function buildRecentActivity(
  feedItems: HelpRequest[],
  locale: AppLocale,
  copy: StudentDashboardCopy,
): DashboardActivityItem[] {
  return feedItems.slice(0, 5).map((item) => ({
    id: `feed-${item.id}`,
    kind: "reply",
    title: copy.activityReply(item.title),
    excerpt: item.body?.trim() ? item.body.trim().slice(0, 120) : undefined,
    href: `/requests/${item.id}`,
    timeAgo: formatRelativeTime(item.createdAt, locale),
  }));
}

export function mapStudentDashboardFixture(
  source: StudentDashboardSource,
): StudentDashboardFixture {
  const fullName = displayNameFromMe(source.me);
  const firstName = fullName.split(/\s+/)[0] ?? fullName;
  const todos = buildTodos(
    source.myRequests,
    source.conversations,
    source.locale,
    source.copy,
  );
  const unreadMessages = source.conversations.reduce(
    (sum, item) => sum + item.unreadCount,
    0,
  );
  const activeRequests = source.myRequests.filter(
    (item) => (item.responsesCount ?? 0) > 0,
  ).length;

  const dashboardCount = todos.length;
  const feedCount = Math.min(source.feedItems.length, 9);

  return {
    firstName,
    fullName,
    initials: initialsFromName(fullName),
    dateLabel: source.copy.dateLabel,
    summaryLine: source.copy.summaryLine(activeRequests, unreadMessages),
    todos,
    recentActivity: buildRecentActivity(
      source.feedItems,
      source.locale,
      source.copy,
    ),
    shortcuts: SHORTCUTS,
    badgeCounts: {
      dashboard: dashboardCount > 0 ? dashboardCount : undefined,
      feed: feedCount > 0 ? feedCount : undefined,
      messages: unreadMessages > 0 ? unreadMessages : undefined,
    },
  };
}

export type SidebarBadgeCounts = {
  messageCount: number;
  feedCount: number;
  dashboardCount: number;
};

export function sidebarBadgesFromFixture(
  fixture: StudentDashboardFixture,
): SidebarBadgeCounts {
  return {
    messageCount: fixture.badgeCounts?.messages ?? 0,
    feedCount: fixture.badgeCounts?.feed ?? 0,
    dashboardCount: fixture.badgeCounts?.dashboard ?? 0,
  };
}
