import type { Meta, StoryObj } from "@storybook/react";

import {
  ForgotPasswordScreen,
  LandingLoginScreen,
  LandingPresentationScreen,
  OAuthOnboardingScreen,
  RegisterScreen,
} from "./screens/legacy-screens";
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/Auth",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Public marketing homepage (`/`) — hero + CTAs; login is on dedicated page. */
export const LandingPresentation: Story = {
  name: "LandingPresentation",
  render: () => <LandingPresentationScreen />,
};

export const LandingLogin: Story = {
  name: "LoginDedicated",
  render: () => <LandingLoginScreen />,
};

export const Register: Story = {
  name: "Register",
  render: () => <RegisterScreen />,
};

export const ForgotPassword: Story = {
  name: "ForgotPassword",
  render: () => <ForgotPasswordScreen />,
};

export const OAuthOnboarding: Story = {
  name: "OAuthOnboarding",
  render: () => <OAuthOnboardingScreen />,
};
