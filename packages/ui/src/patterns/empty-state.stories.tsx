import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { useMvpPatternLabels } from "../i18n/storybook-locale";
import {
  PatternDemoCardShell,
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/EmptyState",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function FeedEmptyStory() {
  const labels = useMvpPatternLabels().emptyState;

  return (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">{labels.feedTitle}</p>
      <p className="m-0 text-sm text-muted-foreground">{labels.feedDescription}</p>
      <Button variant="outline">{labels.feedCta}</Button>
    </PatternDemoCardShell>
  );
}

function ResponsesEmptyStory() {
  const labels = useMvpPatternLabels().emptyState;

  return (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">{labels.responsesTitle}</p>
      <p className="m-0 text-sm text-muted-foreground">
        {labels.responsesDescription}
      </p>
    </PatternDemoCardShell>
  );
}

function NotFoundStory() {
  const labels = useMvpPatternLabels().emptyState;

  return (
    <PatternDemoCardShell>
      <p className="m-0 text-2xl font-semibold">{labels.notFoundTitle}</p>
      <p className="m-0 text-sm text-muted-foreground">
        {labels.notFoundDescriptionBefore}{" "}
        <span className="whitespace-nowrap">
          <code className="text-foreground">{labels.notFoundId}</code>
          {labels.notFoundDescriptionAfter}
        </span>
      </p>
      <Button variant="outline">{labels.backToFeed}</Button>
    </PatternDemoCardShell>
  );
}

function MentorFeedEmptyStory() {
  const labels = useMvpPatternLabels().emptyState;

  return (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">{labels.mentorFeedTitle}</p>
      <p className="m-0 text-sm text-muted-foreground">
        {labels.mentorFeedDescription}
      </p>
    </PatternDemoCardShell>
  );
}

export const FeedEmpty: Story = {
  render: () => <FeedEmptyStory />,
};

export const ResponsesEmpty: Story = {
  render: () => <ResponsesEmptyStory />,
};

export const NotFound: Story = {
  render: () => <NotFoundStory />,
};

export const MentorFeedEmpty: Story = {
  render: () => <MentorFeedEmptyStory />,
};
