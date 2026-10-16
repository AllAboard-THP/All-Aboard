import type { Meta, StoryObj } from "@storybook/react";

import {
  LegalCguScreen,
  LegalMentionsScreen,
  LegalPrivacyScreen,
} from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens/Legal",
  parameters: mobileStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LegalCgu: Story = {
  name: "LegalCgu",
  render: () => <LegalCguScreen />,
};

export const LegalPrivacy: Story = {
  name: "LegalPrivacy",
  render: () => <LegalPrivacyScreen />,
};

export const LegalMentions: Story = {
  name: "LegalMentions",
  render: () => <LegalMentionsScreen />,
};
