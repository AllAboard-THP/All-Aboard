import type {
  HelpRequest,
  PublicUserResponse,
  Response,
  UserPublicProfile,
} from "@allaboard/types";
import type {
  ProfileActivityPost,
  ProfileActivityReply,
  ProfileStatsView,
} from "@allaboard/ui/patterns/profile-types";

import type { AppLocale } from "@/i18n/routing";
import {
  mapHelpRequestsToPosts,
  mapResponsesToReplies,
  mapStats,
} from "@/lib/profile-mappers";
import { fetchPublicUserTab } from "@/lib/patch-user-profile";

export type ProfileActivityData = {
  profile: UserPublicProfile;
  stats: ProfileStatsView;
  posts: ProfileActivityPost[];
  replies: ProfileActivityReply[];
};

export async function loadProfileActivity(
  userId: string,
  locale: AppLocale,
  responseCountLabel: (count: number) => string,
): Promise<ProfileActivityData> {
  const postsData = (await fetchPublicUserTab(
    userId,
    "posts",
  )) as PublicUserResponse;
  const postItems = postsData.items as HelpRequest[];
  const titleByRequestId = new Map(
    postItems.map((item) => [item.id, item.title]),
  );

  const stats = mapStats(
    postsData.profile.stats.postsCount,
    postsData.profile.stats.responsesCount,
  );
  const posts = mapHelpRequestsToPosts(postItems, locale, responseCountLabel);

  const responsesData = (await fetchPublicUserTab(
    userId,
    "responses",
  )) as PublicUserResponse;
  const responseItems = responsesData.items as Response[];
  const replies = mapResponsesToReplies(
    responseItems,
    titleByRequestId,
    locale,
  );

  return {
    profile: postsData.profile,
    stats,
    posts,
    replies,
  };
}
