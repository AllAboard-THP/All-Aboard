import type { Meta, StoryObj } from "@storybook/react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import { useAlertLabels, useMvpPatternLabels } from "../i18n/storybook-locale";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/FormField",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame("form")],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function HelpRequestFieldsStory() {
  const labels = useMvpPatternLabels().formField;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="pattern-user-id">{labels.userIdLabel}</Label>
        <Input id="pattern-user-id" defaultValue="bob" autoComplete="username" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-password">{labels.passwordMvpLabel}</Label>
        <Input
          id="pattern-password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-title">{labels.titleLabel}</Label>
        <Textarea
          id="pattern-title"
          rows={3}
          placeholder={labels.titlePlaceholder}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-tags">{labels.tagsLabel}</Label>
        <Input id="pattern-tags" placeholder={labels.tagsPlaceholder} />
      </div>
      <Button className="w-full">{labels.submitButton}</Button>
    </div>
  );
}

function InlineErrorStory() {
  const alertLabels = useAlertLabels();
  const labels = useMvpPatternLabels().formField;

  return (
    <div className="grid gap-2">
      <Label htmlFor="pattern-invalid-login">{labels.passwordMvpLabel}</Label>
      <Input
        id="pattern-invalid-login"
        type="password"
        aria-invalid={true}
      />
      <Alert variant="destructive">
        <AlertTitle>{alertLabels.error}</AlertTitle>
        <AlertDescription>{labels.invalidCredentials}</AlertDescription>
      </Alert>
    </div>
  );
}

function DuplicateErrorStory() {
  const labels = useMvpPatternLabels().formField;

  return (
    <Alert variant="destructive">
      <AlertTitle>{labels.duplicateTitle}</AlertTitle>
      <AlertDescription>
        <span className="font-medium text-primary underline">
          {labels.duplicateLink}
        </span>
      </AlertDescription>
    </Alert>
  );
}

function RubberduckHintStory() {
  const labels = useMvpPatternLabels().formField;

  return (
    <Alert>
      <AlertTitle>{labels.rubberduckTitle}</AlertTitle>
      <AlertDescription>{labels.rubberduckDescription}</AlertDescription>
    </Alert>
  );
}

function TextareaFieldStory() {
  const labels = useMvpPatternLabels().formField;

  return (
    <div className="grid gap-2">
      <Label htmlFor="pattern-description">{labels.descriptionLabel}</Label>
      <Textarea
        id="pattern-description"
        rows={4}
        placeholder={labels.descriptionPlaceholder}
      />
    </div>
  );
}

export const HelpRequestFields: Story = {
  render: () => <HelpRequestFieldsStory />,
};

export const InlineError: Story = {
  render: () => <InlineErrorStory />,
};

export const DuplicateError: Story = {
  render: () => <DuplicateErrorStory />,
};

export const RubberduckHint: Story = {
  render: () => <RubberduckHintStory />,
};

export const TextareaField: Story = {
  render: () => <TextareaFieldStory />,
};
