import type { Meta, StoryObj } from "@storybook/react";

import { MentorDashboardScreen } from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens/Dashboards",
  parameters: mobileStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const MentorDashboard: Story = {
  name: "MentorDashboard",
  render: () => <MentorDashboardScreen mobileChrome />,
};
