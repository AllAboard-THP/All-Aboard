import type { Meta, StoryObj } from "@storybook/react";

import {
  ForgotPasswordScreen,
  LandingLoginScreen,
  RegisterScreen,
} from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens/Auth",
  parameters: mobileStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LandingLogin: Story = {
  name: "LandingLogin",
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
