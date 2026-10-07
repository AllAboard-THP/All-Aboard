import type { Meta, StoryObj } from "@storybook/react";

import {
  useLegacyLabels,
  useLegacyLegalContent,
} from "../i18n/storybook-locale";
import { LegalPageLayout } from "./legacy-legal-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Legal",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function CguLayoutStory() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("cgu");
  return (
    <div className="w-full max-w-3xl">
      <LegalPageLayout content={content} labels={labels} />
    </div>
  );
}

function PrivacyLayoutStory() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("privacy");
  return (
    <div className="w-full max-w-3xl">
      <LegalPageLayout content={content} labels={labels} />
    </div>
  );
}

function MentionsLayoutStory() {
  const labels = useLegacyLabels();
  const content = useLegacyLegalContent("mentions");
  return (
    <div className="w-full max-w-3xl">
      <LegalPageLayout content={content} labels={labels} />
    </div>
  );
}

export const LegalPageLayoutCgu: Story = {
  name: "LegalPageLayout/CGU",
  decorators: [withPatternStoryFrame("full")],
  render: () => <CguLayoutStory />,
};

export const LegalPageLayoutPrivacy: Story = {
  name: "LegalPageLayout/Privacy",
  decorators: [withPatternStoryFrame("full")],
  render: () => <PrivacyLayoutStory />,
};

export const LegalPageLayoutMentions: Story = {
  name: "LegalPageLayout/Mentions",
  decorators: [withPatternStoryFrame("full")],
  render: () => <MentionsLayoutStory />,
};
