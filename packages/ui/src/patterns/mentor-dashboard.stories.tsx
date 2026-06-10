import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import {
  mentorDashboardFixtureEn,
  mentorDashboardFixtureFr,
} from "./fixtures/mentor-dashboard";
import {
  mentorDashboardLabelsEn,
  mentorDashboardLabelsFr,
} from "./mentor-dashboard-labels";
import { MentorDashboardScreen } from "./mentor-dashboard-screen";
import { patternStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/MentorDashboard",
  id: "screens-mentordashboard",
  component: MentorDashboardScreen,
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta<typeof MentorDashboardScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultFr: Story = {
  name: "Default (FR)",
  args: {
    labels: mentorDashboardLabelsFr,
    fixture: mentorDashboardFixtureFr,
    locale: "fr",
    onDemoAction: (message) => toast.message(message),
  },
};

export const DefaultEn: Story = {
  name: "Default (EN)",
  args: {
    labels: mentorDashboardLabelsEn,
    fixture: mentorDashboardFixtureEn,
    locale: "en",
    onDemoAction: (message) => toast.message(message),
  },
};

export const ContentOnly: Story = {
  name: "Content (AppShell)",
  args: {
    labels: mentorDashboardLabelsFr,
    fixture: mentorDashboardFixtureFr,
    variant: "content",
    onDemoAction: (message) => toast.message(message),
  },
};
