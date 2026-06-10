import type { Meta, StoryObj } from "@storybook/react";

import {
  AdminDashboardScreen,
  AdminModerationScreen,
  AdminUsersScreen,
} from "./screens/legacy-screens";
import { mobileStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Mobile/Screens/Admin",
  parameters: mobileStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminDashboard: Story = {
  name: "AdminDashboard",
  render: () => <AdminDashboardScreen mobileChrome />,
};

export const AdminModeration: Story = {
  name: "AdminModeration",
  render: () => <AdminModerationScreen mobileChrome />,
};

export const AdminUsers: Story = {
  name: "AdminUsers",
  render: () => <AdminUsersScreen mobileChrome />,
};
