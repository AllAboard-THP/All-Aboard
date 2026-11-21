import type { Meta, StoryObj } from "@storybook/react";

import { useAlertLabels } from "../i18n/storybook-locale";
import {
  patternDemoAlertClassName,
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

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

function DefaultStory() {
  const labels = useAlertLabels();

  return (
    <Alert className={patternDemoAlertClassName}>
      <AlertTitle>{labels.information}</AlertTitle>
      <AlertDescription>{labels.neutralMessage}</AlertDescription>
    </Alert>
  );
}

function ConnexionRequiseStory() {
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

function DestructiveStory() {
  const labels = useAlertLabels();

  return (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>{labels.feedLoadError}</AlertTitle>
      <AlertDescription>{labels.http502}</AlertDescription>
    </Alert>
  );
}

function AllVariantsStory() {
  const labels = useAlertLabels();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Alert className={patternDemoAlertClassName}>
        <AlertTitle>{labels.information}</AlertTitle>
        <AlertDescription>{labels.neutralMessageShort}</AlertDescription>
      </Alert>
      <Alert variant="destructive" className={patternDemoAlertClassName}>
        <AlertTitle>{labels.feedLoadError}</AlertTitle>
        <AlertDescription>{labels.http502}</AlertDescription>
      </Alert>
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultStory />,
};

export const ConnexionRequise: Story = {
  name: "ConnexionRequise",
  render: () => <ConnexionRequiseStory />,
};

export const Destructive: Story = {
  render: () => <DestructiveStory />,
};

export const AllVariants: Story = {
  render: () => <AllVariantsStory />,
};
