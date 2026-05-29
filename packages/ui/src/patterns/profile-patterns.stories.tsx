import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels, useLegacyProfile } from "../i18n/storybook-locale";
import {
  ProfileAboutCard,
  ProfileActivityTabs,
  ProfileHeaderCard,
  ProfileStatGrid,
} from "./legacy-profile-patterns";
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
