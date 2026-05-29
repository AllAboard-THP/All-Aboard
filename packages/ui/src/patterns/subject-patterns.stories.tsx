import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { legacySubjects } from "./fixtures/legacy-subjects";
import {
  ProposeSubjectCard,
  SubjectCard,
  SubjectCardGrid,
  SubjectTag,
} from "./legacy-ui";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Subjects",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame("feed")],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function SubjectTagStory() {
  const subject = legacySubjects[1];
  return (
    <SubjectTag
      name={subject.name}
      accentColor={subject.accentColor}
      icon={subject.icon}
    />
  );
}

function SubjectCardStory() {
  const labels = useLegacyLabels();
  return <SubjectCard subject={legacySubjects[1]} labels={labels} />;
}

function ProposeSubjectStory() {
  const labels = useLegacyLabels();
  return <ProposeSubjectCard labels={labels} />;
}

function SubjectGridStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-6xl px-4">
      <SubjectCardGrid labels={labels} />
    </div>
  );
}

export const Tag: Story = {
  name: "SubjectTag",
  render: () => <SubjectTagStory />,
};

export const Card: Story = {
  name: "SubjectCard",
  render: () => <SubjectCardStory />,
};

export const ProposeSubject: Story = {
  name: "SubjectCard/ProposeSubject",
  render: () => <ProposeSubjectStory />,
};

export const Grid: Story = {
  name: "SubjectCard/Grid",
  decorators: [withPatternStoryFrame("full")],
  render: () => <SubjectGridStory />,
};
