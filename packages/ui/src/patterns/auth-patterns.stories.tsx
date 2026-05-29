import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import {
  ForgotPasswordForm,
  RegisterForm,
} from "./legacy-auth-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Components/Auth",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function RegisterFormStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-lg">
      <RegisterForm labels={labels} />
    </div>
  );
}

function ForgotPasswordFormStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-lg">
      <ForgotPasswordForm labels={labels} />
    </div>
  );
}

export const RegisterFormDefault: Story = {
  name: "RegisterForm",
  decorators: [withPatternStoryFrame()],
  render: () => <RegisterFormStory />,
};

export const ForgotPasswordFormDefault: Story = {
  name: "ForgotPasswordForm",
  decorators: [withPatternStoryFrame()],
  render: () => <ForgotPasswordFormStory />,
};
