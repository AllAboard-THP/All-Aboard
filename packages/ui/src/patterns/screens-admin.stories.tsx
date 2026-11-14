import type { Meta, StoryObj } from "@storybook/react";

import {
  AdminDashboardScreen,
  AdminModerationScreen,
  AdminUsersScreen,
} from "./screens/legacy-screens";
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/Admin",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AdminDashboard: Story = {
  name: "AdminDashboard",
  render: () => <AdminDashboardScreen />,
};

export const AdminModeration: Story = {
  name: "AdminModeration",
  render: () => <AdminModerationScreen />,
};

export const AdminUsers: Story = {
  name: "AdminUsers",
  render: () => <AdminUsersScreen />,
};
