import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { LoginDedicatedBody } from "./login-dedicated-body";
import { LoginDedicatedShell } from "./login-dedicated-shell";
import { screenStoryParameters } from "./pattern-story-frame";
import { legacyDemoToast } from "./legacy-story-feedback";

const meta = {
  title: "Patterns/LoginDedicated",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LoginDedicatedStory() {
  const labels = useLegacyLabels();

  return (
    <LoginDedicatedShell
      labels={labels}
      activeAction="signIn"
      onLogoClick={() => legacyDemoToast(labels.brandName)}
      onSignInClick={() => legacyDemoToast(labels.auth.signIn)}
      onSignUpClick={() => legacyDemoToast(labels.auth.signUp)}
    >
      <LoginDedicatedBody
        labels={labels}
        onForgotPasswordClick={() => legacyDemoToast(labels.auth.forgotPassword)}
        onSignUpClick={() => legacyDemoToast(labels.auth.signUp)}
        onGoogleSignInClick={() =>
          legacyDemoToast(labels.auth.continueWithGoogle)
        }
      />
    </LoginDedicatedShell>
  );
}

export const Default: Story = {
  name: "LoginDedicated",
  render: () => <LoginDedicatedStory />,
};
