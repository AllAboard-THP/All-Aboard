import {
  fetchConversations,
  fetchMyHelpRequests,
} from "@/lib/api-server";
import type { SidebarBadgeCounts } from "@/lib/map-student-dashboard";

export async function fetchSidebarBadgeCounts(
  accessToken: string,
): Promise<SidebarBadgeCounts> {
  const [conversationsResult, myRequestsResult] = await Promise.all([
    fetchConversations(accessToken),
    fetchMyHelpRequests(accessToken),
  ]);

  const unreadMessages = conversationsResult.ok
    ? conversationsResult.data.items.reduce((sum, item) => sum + item.unreadCount, 0)
    : 0;

  const activeRequests = myRequestsResult.ok
    ? myRequestsResult.data.items.filter((item) => (item.responsesCount ?? 0) > 0)
        .length
    : 0;

  let dashboardCount = 0;
  if (activeRequests > 0) dashboardCount += Math.min(activeRequests, 2);
  if (unreadMessages > 0) dashboardCount += 1;

  return {
    messageCount: unreadMessages,
    feedCount: 0,
    dashboardCount: Math.min(dashboardCount, 3),
  };
}
