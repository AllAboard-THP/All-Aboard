"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import {
  ProfileHeaderCard,
  ProfileStatGrid,
} from "@allaboard/ui/patterns/legacy-profile-patterns";
import { ProfilePageLayout } from "@allaboard/ui/patterns/profile-page-layout";
import {
  ProfileAboutReadOnly,
  ProfileActivityPanel,
  ProfileSubjectsPanel,
} from "@allaboard/ui/patterns/profile-panels";
import type {
  ProfileActivityPost,
  ProfileActivityReply,
} from "@allaboard/ui/patterns/profile-types";

import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { loadProfileActivity } from "@/lib/load-profile-activity";
import { PublicProfileNotFoundError } from "@/lib/patch-user-profile";
import {
  buildPublicProfilePageLabels,
  formatMemberSinceLabel,
  mapPublicProfileToIdentity,
  mapPublicSubjects,
  mapStats,
  roleLabelFor,
} from "@/lib/profile-mappers";

export function PublicProfilePage({ userId }: { userId: string }) {
  const legacyLabels = useLegacyLabels();
  const t = useTranslations("publicProfilePage");
  const tFeed = useTranslations("feed");
  const router = useRouter();
  const locale = useLocale() as AppLocale;

  const [stats, setStats] = useState(mapStats(0, 0));
  const [posts, setPosts] = useState<ProfileActivityPost[]>([]);
  const [replies, setReplies] = useState<ProfileActivityReply[]>([]);
  const [identity, setIdentity] = useState<ReturnType<
    typeof mapPublicProfileToIdentity
  > | null>(null);
  const [subjects, setSubjects] = useState<
    ReturnType<typeof mapPublicSubjects>
  >([]);
  const [activityTab, setActivityTab] = useState<"posts" | "responses">("posts");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageLabels = useMemo(() => buildPublicProfilePageLabels(t), [t]);

  const responseCountLabel = useCallback(
    (count: number) => tFeed("responseCount", { count }),
    [tFeed],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPublicProfile() {
      try {
        const activity = await loadProfileActivity(
          userId,
          locale,
          responseCountLabel,
        );
        if (cancelled) return;

        const memberSinceLabel = activity.profile.createdAt
          ? formatMemberSinceLabel(activity.profile.createdAt, locale, t)
          : undefined;

        setIdentity(
          mapPublicProfileToIdentity(activity.profile, memberSinceLabel),
        );
        setSubjects(mapPublicSubjects(activity.profile));
        setStats(activity.stats);
        setPosts(activity.posts);
        setReplies(activity.replies);
      } catch (error) {
        if (!cancelled) {
          if (error instanceof PublicProfileNotFoundError) {
            setNotFound(true);
          } else {
            setErrorMessage(t("loadError"));
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPublicProfile();
    return () => {
      cancelled = true;
    };
  }, [locale, responseCountLabel, t, userId]);

  const headerProfile = useMemo(() => {
    if (!identity) return null;
    return {
      name: identity.name,
      initials: identity.initials,
      headline: identity.headline,
      educationLevel: identity.educationLevel,
      bio: identity.bio,
      postsCount: stats.postsCount,
      repliesCount: stats.responsesCount,
      rating: stats.ratingLabel,
      posts: [],
      replies: [],
    };
  }, [identity, stats]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <Card data-testid="public-profile-not-found">
          <CardHeader>
            <CardTitle>{t("notFoundTitle")}</CardTitle>
            <CardDescription>{t("notFoundDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/feed">{t("backToFeed")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (errorMessage || !identity || !headerProfile) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-destructive">
        {errorMessage ?? t("loadError")}
      </div>
    );
  }

  return (
    <ProfilePageLayout
      eyebrow={t("eyebrow")}
      header={
        <ProfileHeaderCard
          profile={headerProfile}
          labels={legacyLabels}
          showMessageCta
          avatarUrl={identity.avatarUrl}
          roleBadgeLabel={roleLabelFor(identity.role, pageLabels)}
          memberSinceLabel={identity.memberSinceLabel}
          onMessageClick={() => router.push("/messages")}
        />
      }
      stats={<ProfileStatGrid profile={headerProfile} labels={legacyLabels} />}
      about={
        <ProfileAboutReadOnly
          title={pageLabels.aboutTitle}
          bio={identity.bio}
          emptyLabel={t("aboutEmpty")}
        />
      }
      sidebar={
        <ProfileSubjectsPanel labels={pageLabels} subjects={subjects} />
      }
      activity={
        <ProfileActivityPanel
          labels={pageLabels}
          posts={posts}
          replies={replies}
          activeTab={activityTab}
          onTabChange={setActivityTab}
          onPostClick={(postId) => router.push(`/requests/${postId}`)}
          onReplyClick={(helpRequestId) =>
            router.push(`/requests/${helpRequestId}`)
          }
        />
      }
    />
  );
}
