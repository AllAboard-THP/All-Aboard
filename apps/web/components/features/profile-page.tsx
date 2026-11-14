"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthMeResponse } from "@allaboard/types";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@allaboard/ui/components/button";
import { useLegacyLabels } from "@allaboard/ui/i18n/storybook-locale";
import {
  OAuthOnboardingForm,
  type OAuthOnboardingSubmitInput,
} from "@allaboard/ui/patterns/legacy-auth-patterns";
import {
  ProfileHeaderCard,
  ProfileStatGrid,
} from "@allaboard/ui/patterns/legacy-profile-patterns";
import { ProfilePageLayout } from "@allaboard/ui/patterns/profile-page-layout";
import {
  ProfileAboutEditor,
  ProfileAccountPanel,
  ProfileActivityPanel,
  ProfileSubjectsEditor,
} from "@allaboard/ui/patterns/profile-panels";
import type {
  ProfileActivityPost,
  ProfileActivityReply,
  ProfileSubjectCatalogItem,
} from "@allaboard/ui/patterns/profile-types";

import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";
import { fetchSubjectCatalog } from "@/lib/fetch-subject-catalog";
import { loadProfileActivity } from "@/lib/load-profile-activity";
import { openLegalCgu } from "@/lib/open-legal-cgu";
import { fetchAuthMe, patchUserProfile } from "@/lib/patch-user-profile";
import {
  buildAvatarUploadLabels,
  buildProfilePageLabels,
  formatMemberSinceLabel,
  mapAuthMeToIdentity,
  mapStats,
  roleLabelFor,
} from "@/lib/profile-mappers";
import { submitProfileCompletion } from "@/lib/submit-profile-completion";
import { deleteAvatar, uploadAvatar } from "@/lib/upload-avatar";

function resolvePublicProfileId(me: AuthMeResponse): string | null {
  return me.id ?? null;
}

export function ProfilePage() {
  const legacyLabels = useLegacyLabels();
  const t = useTranslations("profilePage");
  const tFeed = useTranslations("feed");
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const identityFormRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [stats, setStats] = useState(mapStats(0, 0));
  const [posts, setPosts] = useState<ProfileActivityPost[]>([]);
  const [replies, setReplies] = useState<ProfileActivityReply[]>([]);
  const [subjectCatalog, setSubjectCatalog] = useState<
    ProfileSubjectCatalogItem[]
  >([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [bioDraft, setBioDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState("");
  const [notifyOnComment, setNotifyOnComment] = useState(true);
  const [notifyOnMessage, setNotifyOnMessage] = useState(true);
  const [activityTab, setActivityTab] = useState<"posts" | "responses">("posts");

  const [loading, setLoading] = useState(true);
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const [subjectsSaving, setSubjectsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pageLabels = useMemo(
    () => buildProfilePageLabels(t, legacyLabels.profile.levelPrefix),
    [t, legacyLabels.profile.levelPrefix],
  );
  const avatarUploadLabels = useMemo(() => buildAvatarUploadLabels(t), [t]);

  const responseCountLabel = useCallback(
    (count: number) => tFeed("responseCount", { count }),
    [tFeed],
  );

  const loadActivity = useCallback(
    async (publicProfileId: string) => {
      const activity = await loadProfileActivity(
        publicProfileId,
        locale,
        responseCountLabel,
      );
      setStats(activity.stats);
      setPosts(activity.posts);
      setReplies(activity.replies);
    },
    [locale, responseCountLabel],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const me = await fetchAuthMe();
        if (cancelled) return;

        if (!me) {
          router.replace("/");
          return;
        }

        setProfile(me);
        setBioDraft(me.bio?.trim() ?? "");
        setAvatarDraft(me.avatarUrl?.trim() ?? "");
        setNotifyOnComment(me.notifyOnComment ?? true);
        setNotifyOnMessage(me.notifyOnMessage ?? true);
        setSelectedSubjectIds(
          (me.competenceSubjects ?? []).map((subject) => subject.id),
        );

        const [catalog] = await Promise.all([
          fetchSubjectCatalog().catch(() => [] as ProfileSubjectCatalogItem[]),
          (async () => {
            const publicId = resolvePublicProfileId(me);
            if (publicId) {
              await loadActivity(publicId);
            }
          })(),
        ]);
        if (!cancelled) {
          setSubjectCatalog(catalog);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage(t("loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [loadActivity, router, t]);

  const memberSinceLabel = useMemo(() => {
    if (!profile?.createdAt) return undefined;
    return formatMemberSinceLabel(profile.createdAt, locale, t);
  }, [profile?.createdAt, locale, t]);

  const identity = useMemo(() => {
    if (!profile) return null;
    return mapAuthMeToIdentity(profile, memberSinceLabel ?? "");
  }, [profile, memberSinceLabel]);

  const headerProfile = useMemo(() => {
    if (!identity) return null;
    return {
      name: identity.name,
      initials: identity.initials,
      headline: identity.headline,
      educationLevel: identity.educationLevel,
      bio: bioDraft,
      postsCount: stats.postsCount,
      repliesCount: stats.responsesCount,
      rating: stats.ratingLabel,
      posts: [],
      replies: [],
    };
  }, [bioDraft, identity, stats]);

  const publicProfileId = profile ? resolvePublicProfileId(profile) : null;

  const cguAcceptedLabel = profile?.cguAcceptedAt
    ? t("cguAcceptedOn", {
        date: formatDateTime(profile.cguAcceptedAt, locale),
      })
    : undefined;

  function scrollToIdentityForm() {
    identityFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function toggleSubject(subjectId: string) {
    setSelectedSubjectIds((current) =>
      current.includes(subjectId)
        ? current.filter((id) => id !== subjectId)
        : [...current, subjectId],
    );
  }

  async function handleIdentitySubmit(input: OAuthOnboardingSubmitInput) {
    if (!profile) return;
    const needsLegal = !profile.cguAcceptedAt;
    if (needsLegal && !input.acceptCgu) return;

    setIdentitySubmitting(true);
    setErrorMessage(null);

    const result = await submitProfileCompletion(input, {
      acceptLegal: needsLegal,
    });

    if (!result.ok) {
      setErrorMessage(t("saveError"));
      setIdentitySubmitting(false);
      return;
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            fullName: input.fullName,
            displayName: input.fullName,
            educationLevel: input.educationLevel ?? undefined,
            headline: input.headline ?? undefined,
            cguAcceptedAt: needsLegal
              ? new Date().toISOString()
              : current.cguAcceptedAt,
          }
        : current,
    );
    setIdentitySubmitting(false);
    toast.success(t("saveSuccess"));
  }

  async function handleAvatarUpload(file: Blob) {
    if (!profile) return;

    setAvatarUploading(true);
    const result = await uploadAvatar(file);
    setAvatarUploading(false);

    if (!result.ok) {
      toast.error(t("avatarSaveError"));
      return;
    }

    setAvatarDraft(result.avatarUrl);
    setProfile((current) =>
      current ? { ...current, avatarUrl: result.avatarUrl } : current,
    );
    toast.success(t("avatarSaveSuccess"));
  }

  async function handleAvatarRemove() {
    if (!profile) return;

    setAvatarUploading(true);
    const ok = await deleteAvatar();
    setAvatarUploading(false);

    if (!ok) {
      toast.error(t("avatarSaveError"));
      return;
    }

    setAvatarDraft("");
    setProfile((current) =>
      current ? { ...current, avatarUrl: undefined } : current,
    );
    toast.success(t("avatarSaveSuccess"));
  }

  async function handleBioSave() {
    if (!profile) return;
    setBioSaving(true);
    const result = await patchUserProfile({ bio: bioDraft.trim() || null });
    setBioSaving(false);

    if (!result.ok) {
      toast.error(t("saveError"));
      return;
    }

    setProfile((current) =>
      current ? { ...current, bio: bioDraft.trim() || undefined } : current,
    );
    toast.success(t("bioSaveSuccess"));
  }

  async function handleAccountSave() {
    if (!profile) return;
    setAccountSaving(true);
    const result = await patchUserProfile({
      notifyOnComment,
      notifyOnMessage,
    });
    setAccountSaving(false);

    if (!result.ok) {
      toast.error(t("saveError"));
      return;
    }

    setProfile((current) =>
      current
        ? { ...current, notifyOnComment, notifyOnMessage }
        : current,
    );
    toast.success(t("accountSaveSuccess"));
  }

  async function handleSubjectsSave() {
    if (!profile) return;
    setSubjectsSaving(true);
    const result = await patchUserProfile({ subjectIds: selectedSubjectIds });
    setSubjectsSaving(false);

    if (!result.ok) {
      toast.error(t("saveError"));
      return;
    }

    const refreshed = await fetchAuthMe();
    if (refreshed) {
      setProfile(refreshed);
      setSelectedSubjectIds(
        (refreshed.competenceSubjects ?? []).map((subject) => subject.id),
      );
    }
    toast.success(t("subjectsSaveSuccess"));
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!profile || !identity || !headerProfile) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-destructive">
        {errorMessage ?? t("loadError")}
      </div>
    );
  }

  return (
    <ProfilePageLayout
      eyebrow={
        <span className="flex flex-wrap items-center gap-3">
          <span>{t("eyebrow")}</span>
          {publicProfileId ? (
            <Link
              href={`/users/${publicProfileId}`}
              className="text-xs font-semibold normal-case tracking-normal text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {t("publicProfileLink")}
            </Link>
          ) : null}
        </span>
      }
      header={
        <ProfileHeaderCard
          profile={headerProfile}
          labels={legacyLabels}
          showMessageCta={false}
          avatarUrl={avatarDraft.trim() || identity.avatarUrl}
          roleBadgeLabel={roleLabelFor(identity.role, pageLabels)}
          memberSinceLabel={memberSinceLabel}
          editButtonLabel={pageLabels.editProfile}
          onEditClick={scrollToIdentityForm}
        />
      }
      stats={<ProfileStatGrid profile={headerProfile} labels={legacyLabels} />}
      about={
        <ProfileAboutEditor
          title={pageLabels.aboutTitle}
          placeholder={pageLabels.aboutPlaceholder}
          value={bioDraft}
          onChange={setBioDraft}
          saveLabel={pageLabels.aboutSave}
          onSave={() => void handleBioSave()}
          saving={bioSaving}
        />
      }
      identity={
        <div ref={identityFormRef}>
          <OAuthOnboardingForm
            key={profile.userId}
            variant="profile"
            labels={legacyLabels}
            fieldIdPrefix="profile"
            showCgu={!profile.cguAcceptedAt}
            initialFullName={profile.fullName ?? profile.displayName ?? ""}
            initialEducationLevel={profile.educationLevel ?? ""}
            initialHeadline={profile.headline ?? ""}
            avatarUrl={avatarDraft.trim() || profile.avatarUrl}
            avatarLabels={avatarUploadLabels}
            avatarDisplayName={identity.name}
            avatarInitials={identity.initials}
            avatarUploading={avatarUploading}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            submitting={identitySubmitting}
            errorMessage={errorMessage}
            onSubmit={handleIdentitySubmit}
            onCguClick={() => openLegalCgu(locale)}
          />
        </div>
      }
      sidebar={
        <>
          <ProfileSubjectsEditor
            labels={pageLabels}
            catalog={subjectCatalog}
            selectedIds={selectedSubjectIds}
            onToggle={toggleSubject}
            saveLabel={pageLabels.subjectsSave}
            hint={pageLabels.subjectsHint}
            onSave={() => void handleSubjectsSave()}
            saving={subjectsSaving}
            exploreAction={
              <Button asChild variant="outline" className="sm:flex-1">
                <Link href="/explore">{pageLabels.subjectsCta}</Link>
              </Button>
            }
          />
          <ProfileAccountPanel
            labels={pageLabels}
            email={profile.email ?? profile.userId}
            cguAcceptedLabel={cguAcceptedLabel}
            notifyOnComment={notifyOnComment}
            notifyOnMessage={notifyOnMessage}
            onNotifyOnCommentChange={setNotifyOnComment}
            onNotifyOnMessageChange={setNotifyOnMessage}
            onSave={() => void handleAccountSave()}
            saving={accountSaving}
          />
        </>
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
          postsEmptyAction={
            <Button asChild>
              <Link href="/help/new">{pageLabels.newRequestCta}</Link>
            </Button>
          }
        />
      }
    />
  );
}
