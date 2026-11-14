import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels, useLegacyProfile } from "../i18n/storybook-locale";
import {
  OAuthOnboardingForm,
} from "./legacy-auth-patterns";
import { legacyDemoToast } from "./legacy-story-feedback";
import {
  ProfileAboutCard,
  ProfileActivityTabs,
  ProfileHeaderCard,
  ProfileStatGrid,
} from "./legacy-profile-patterns";
import { ProfilePageLayout } from "./profile-page-layout";
import {
  ProfileAboutReadOnly,
  ProfileActivityPanel,
  ProfileSubjectsPanel,
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
import { withAppShellStoryFrame } from "./app-shell-story-frame";
import { ProfilePrivatePageDemo } from "./profile-page-screen";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Profile",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function HeaderStory() {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();
  return (
    <div className="w-full max-w-4xl">
      <ProfileHeaderCard profile={profile} labels={labels} />
    </div>
  );
}

function StatsStory() {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();
  return (
    <div className="w-full max-w-4xl">
      <ProfileStatGrid profile={profile} labels={labels} />
    </div>
  );
}

function AboutStory() {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();
  return (
    <div className="w-full max-w-4xl">
      <ProfileAboutCard profile={profile} labels={labels} />
    </div>
  );
}

function ActivityTabsStory() {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();
  return (
    <div className="w-full max-w-4xl">
      <ProfileActivityTabs profile={profile} labels={labels} />
    </div>
  );
}

function ProfileFormOnlyStory() {
  const labels = useLegacyLabels();
  const profile = useLegacyProfile();
  return (
    <div className="w-full max-w-2xl space-y-6">
      <ProfileHeaderCard profile={profile} labels={labels} showMessageCta={false} />
      <OAuthOnboardingForm
        variant="profile"
        labels={labels}
        fieldIdPrefix="profile-pattern"
        showCgu={false}
        initialFullName={profile.name}
        initialEducationLevel={profile.educationLevel}
        initialHeadline={profile.headline}
        avatarUrl={profile.avatarUrl}
        avatarLabels={profileAvatarUploadLabelsFr}
        avatarDisplayName={profile.name}
        avatarInitials={profile.initials}
        onAvatarUpload={async () => {
          legacyDemoToast(labels.auth.profileCompleteSubmit);
        }}
        onSubmit={() => legacyDemoToast(labels.auth.profileCompleteSubmit)}
      />
    </div>
  );
}

function PublicProfilePageStory() {
  const labels = useLegacyLabels();
  const identity = profilePageIdentityFixtureFr;
  const pageLabels = profilePageLabelsFr;
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
      eyebrow="Profil public"
      header={
        <ProfileHeaderCard
          profile={headerProfile}
          labels={labels}
          roleBadgeLabel={pageLabels.roleStudent}
          memberSinceLabel={identity.memberSinceLabel}
        />
      }
      stats={<ProfileStatGrid profile={headerProfile} labels={labels} />}
      about={
        <ProfileAboutReadOnly
          title={pageLabels.aboutTitle}
          bio={identity.bio}
          emptyLabel="Cette personne n'a pas encore rédigé de bio."
        />
      }
      sidebar={
        <ProfileSubjectsPanel
          labels={pageLabels}
          subjects={profilePageSubjectsFixture}
        />
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
        />
      }
    />
  );
}

export const ProfileHeaderCardDefault: Story = {
  name: "ProfileHeaderCard",
  decorators: [withPatternStoryFrame("full")],
  render: () => <HeaderStory />,
};

export const ProfileStatGridDefault: Story = {
  name: "ProfileStatGrid",
  decorators: [withPatternStoryFrame("full")],
  render: () => <StatsStory />,
};

export const ProfileAboutCardDefault: Story = {
  name: "ProfileAboutCard",
  decorators: [withPatternStoryFrame("full")],
  render: () => <AboutStory />,
};

export const ProfileActivityTabsDefault: Story = {
  name: "ProfileActivityTabs",
  decorators: [withPatternStoryFrame("full")],
  render: () => <ActivityTabsStory />,
};

/** Canonical full profile page (private /profile). */
export const ProfileComplete: Story = {
  name: "ProfileComplete",
  decorators: [withAppShellStoryFrame({ activeId: "profile", mockPathname: "/profile" })],
  render: () => <ProfilePrivatePageDemo />,
};

export const ProfilePageRealistic: Story = {
  name: "ProfilePageRealistic",
  decorators: [withAppShellStoryFrame({ activeId: "profile", mockPathname: "/profile" })],
  render: () => <ProfilePrivatePageDemo />,
};

/** Legacy minimal slice: header + identity form only. */
export const ProfileFormOnly: Story = {
  name: "ProfileFormOnly",
  decorators: [withAppShellStoryFrame({ activeId: "profile", mockPathname: "/profile" })],
  render: () => <ProfileFormOnlyStory />,
};

export const PublicProfilePage: Story = {
  name: "PublicProfilePage",
  decorators: [
    withAppShellStoryFrame({ mockPathname: "/users/demo-user-id" }),
  ],
  render: () => <PublicProfilePageStory />,
};
