import type { Meta, StoryObj } from "@storybook/react";

import {
  useLegacyLabels,
  useLegacyMentorDashboard,
} from "../i18n/storybook-locale";
import {
  MentorHelpPanel,
  MentorStatsGrid,
  MentorValidationPanel,
} from "./legacy-mentor-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Mentor",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function MentorStatsStory() {
  const labels = useLegacyLabels();
  const fixture = useLegacyMentorDashboard();
  return (
    <div className="w-full max-w-3xl">
      <MentorStatsGrid fixture={fixture} labels={labels} />
    </div>
  );
}

function MentorHelpStory() {
  const labels = useLegacyLabels();
  const fixture = useLegacyMentorDashboard();
  return (
    <div className="w-full max-w-3xl">
      <MentorHelpPanel posts={fixture.helpPosts} labels={labels} />
    </div>
  );
}

function MentorValidationStory() {
  const labels = useLegacyLabels();
  const fixture = useLegacyMentorDashboard();
  return (
    <div className="w-full max-w-3xl">
      <MentorValidationPanel
        resources={fixture.pendingResources}
        labels={labels}
      />
    </div>
  );
}

export const MentorStatsGridDefault: Story = {
  name: "MentorStatsGrid",
  decorators: [withPatternStoryFrame("full")],
  render: () => <MentorStatsStory />,
};

export const MentorHelpPanelDefault: Story = {
  name: "MentorHelpPanel",
  decorators: [withPatternStoryFrame("full")],
  render: () => <MentorHelpStory />,
};

export const MentorValidationPanelDefault: Story = {
  name: "MentorValidationPanel",
  decorators: [withPatternStoryFrame("full")],
  render: () => <MentorValidationStory />,
};
