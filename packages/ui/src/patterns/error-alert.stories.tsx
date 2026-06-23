import type { Meta, StoryObj } from "@storybook/react";

import { useAlertLabels } from "../i18n/storybook-locale";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import {
  patternDemoAlertClassName,
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/ErrorAlert",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LoginRequiredDescription() {
  const labels = useAlertLabels();

  return (
    <>
      {labels.loginRequiredBodyBefore}{" "}
      <span className="text-primary underline">{labels.loginRequiredLink}</span>{" "}
      {labels.loginRequiredBodyAfter}
    </>
  );
}

function FeedLoadErrorStory() {
  const labels = useAlertLabels();

  return (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>{labels.feedLoadError}</AlertTitle>
      <AlertDescription>{labels.http502}</AlertDescription>
    </Alert>
  );
}

function DetailLoadErrorStory() {
  const labels = useAlertLabels();

  return (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>{labels.requestLoadError}</AlertTitle>
      <AlertDescription>{labels.notFound}</AlertDescription>
    </Alert>
  );
}

function AuthRequiredStory() {
  const labels = useAlertLabels();

  return (
    <Alert className={patternDemoAlertClassName}>
      <AlertTitle>{labels.loginRequired}</AlertTitle>
      <AlertDescription>
        <LoginRequiredDescription />
      </AlertDescription>
    </Alert>
  );
}

function MentorForbiddenStory() {
  const labels = useAlertLabels();

  return (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>{labels.mentorForbidden}</AlertTitle>
      <AlertDescription>{labels.mentorForbiddenDescription}</AlertDescription>
    </Alert>
  );
}

export const FeedLoadError: Story = {
  render: () => <FeedLoadErrorStory />,
};

export const DetailLoadError: Story = {
  render: () => <DetailLoadErrorStory />,
};

export const AuthRequired: Story = {
  render: () => <AuthRequiredStory />,
};

export const MentorForbidden: Story = {
  render: () => <MentorForbiddenStory />,
};
