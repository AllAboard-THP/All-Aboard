"use client";

import { useState } from "react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { Button } from "../components/button";
import { OAuthOnboardingForm } from "./legacy-auth-patterns";
import { legacyDemoToast } from "./legacy-story-feedback";
import {
  ProfileHeaderCard,
  ProfileStatGrid,
} from "./legacy-profile-patterns";
import { ProfilePageLayout } from "./profile-page-layout";
import {
  ProfileAboutEditor,
  ProfileAccountPanel,
  ProfileActivityPanel,
  ProfileSubjectsEditor,
} from "./profile-panels";
import {
  profileAvatarUploadLabelsFr,
  profilePageIdentityFixtureFr,
  profilePageLabelsFr,
  profilePagePostsFixtureFr,
  profilePageRepliesFixtureFr,
  profilePageStatsFixture,
  profilePageSubjectsFixture,
} from "./fixtures/profile-page";

/** Storybook / Screens demo — private profile page (fixture data). */
export function ProfilePrivatePageDemo() {
  const labels = useLegacyLabels();
  const identity = profilePageIdentityFixtureFr;
  const pageLabels = profilePageLabelsFr;
  const [avatarUrl, setAvatarUrl] = useState(identity.avatarUrl ?? "");
  const headerProfile = {
    name: identity.name,
    initials: identity.initials,
    headline: identity.headline,
    educationLevel: identity.educationLevel,
    bio: identity.bio,
    postsCount: profilePageStatsFixture.postsCount,
    repliesCount: profilePageStatsFixture.responsesCount,
    rating: profilePageStatsFixture.ratingLabel,
    posts: [],
    replies: [],
  };

  return (
    <ProfilePageLayout
      eyebrow="Profil"
      header={
        <ProfileHeaderCard
          profile={headerProfile}
          labels={labels}
          showMessageCta={false}
          avatarUrl={avatarUrl.trim() || undefined}
          roleBadgeLabel={pageLabels.roleStudent}
          memberSinceLabel={identity.memberSinceLabel}
          editButtonLabel={pageLabels.editProfile}
          onEditClick={() => legacyDemoToast(pageLabels.editProfile)}
        />
      }
      stats={<ProfileStatGrid profile={headerProfile} labels={labels} />}
      about={
        <ProfileAboutEditor
          title={pageLabels.aboutTitle}
          placeholder={pageLabels.aboutPlaceholder}
          value={identity.bio}
          onChange={() => undefined}
          saveLabel={pageLabels.aboutSave}
          onSave={() => legacyDemoToast(pageLabels.aboutSave)}
        />
      }
      identity={
        <OAuthOnboardingForm
          variant="profile"
          labels={labels}
          fieldIdPrefix="profile-demo"
          showCgu={false}
          initialFullName={identity.name}
          initialEducationLevel={identity.educationLevel}
          initialHeadline={identity.headline}
          avatarUrl={avatarUrl.trim() || undefined}
          avatarLabels={profileAvatarUploadLabelsFr}
          avatarDisplayName={identity.name}
          avatarInitials={identity.initials}
          onAvatarUpload={async (file) => {
            setAvatarUrl(URL.createObjectURL(file));
            legacyDemoToast(labels.auth.profileCompleteSubmit);
          }}
          onAvatarRemove={async () => {
            setAvatarUrl("");
            legacyDemoToast(pageLabels.avatarTitle);
          }}
          onSubmit={() => legacyDemoToast(labels.auth.profileCompleteSubmit)}
        />
      }
      sidebar={
        <>
          <ProfileSubjectsEditor
            labels={pageLabels}
            catalog={profilePageSubjectsFixture.map((subject) => ({
              id: subject.id,
              name: subject.name,
              accentColor: subject.accentColor ?? "#6366f1",
            }))}
            selectedIds={profilePageSubjectsFixture.map((s) => s.id)}
            onToggle={() => undefined}
            saveLabel={pageLabels.subjectsSave}
            hint={pageLabels.subjectsHint}
            onSave={() => legacyDemoToast(pageLabels.subjectsSave)}
            exploreAction={
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => legacyDemoToast(pageLabels.subjectsCta)}
              >
                {pageLabels.subjectsCta}
              </Button>
            }
          />
          <ProfileAccountPanel
            labels={pageLabels}
            email="ines.martin@example.com"
            cguAcceptedLabel="le 12 juin 2026"
            notifyOnComment
            notifyOnMessage={false}
            onNotifyOnCommentChange={() => undefined}
            onNotifyOnMessageChange={() => undefined}
            onSave={() => legacyDemoToast(pageLabels.accountSave)}
          />
        </>
      }
      activity={
        <ProfileActivityPanel
          labels={pageLabels}
          posts={profilePagePostsFixtureFr}
          replies={profilePageRepliesFixtureFr}
          activeTab="posts"
          onTabChange={() => undefined}
          onPostClick={(id) => legacyDemoToast(`Open request ${id}`)}
          onReplyClick={(id) => legacyDemoToast(`Open request ${id}`)}
          postsEmptyAction={
            <Button
              type="button"
              onClick={() => legacyDemoToast(pageLabels.newRequestCta)}
            >
              {pageLabels.newRequestCta}
            </Button>
          }
        />
      }
    />
  );
}
