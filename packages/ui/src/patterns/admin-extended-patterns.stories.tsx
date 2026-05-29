import type { Meta, StoryObj } from "@storybook/react";

import {
  useLegacyAdminUsers,
  useLegacyLabels,
  useLegacyModeration,
} from "../i18n/storybook-locale";
import {
  AdminModerationQueue,
  AdminUsersTable,
} from "./legacy-admin-extended-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Admin Extended",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ModerationStory() {
  const labels = useLegacyLabels();
  const fixture = useLegacyModeration();
  return (
    <div className="w-full">
      <AdminModerationQueue fixture={fixture} labels={labels} />
    </div>
  );
}

function UsersTableStory() {
  const labels = useLegacyLabels();
  const users = useLegacyAdminUsers();
  return (
    <div className="w-full">
      <AdminUsersTable users={users} labels={labels} />
    </div>
  );
}

export const AdminModerationQueueDefault: Story = {
  name: "AdminModerationQueue",
  decorators: [withPatternStoryFrame("full")],
  render: () => <ModerationStory />,
};

export const AdminUsersTableDefault: Story = {
  name: "AdminUsersTable",
  decorators: [withPatternStoryFrame("full")],
  render: () => <UsersTableStory />,
};
