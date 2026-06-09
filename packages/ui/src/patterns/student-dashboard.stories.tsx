import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
} from "./fixtures/student-dashboard";
import {
  studentDashboardLabelsEn,
  studentDashboardLabelsFr,
} from "./student-dashboard-labels";
import { StudentDashboardScreen } from "./student-dashboard-screen";
import { patternStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/StudentDashboard",
  component: StudentDashboardScreen,
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta<typeof StudentDashboardScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultFr: Story = {
  name: "Default (FR)",
  args: {
    labels: studentDashboardLabelsFr,
    fixture: studentDashboardFixtureFr,
    onDemoAction: (message) => toast.message(message),
  },
};

export const DefaultEn: Story = {
  name: "Default (EN)",
  args: {
    labels: studentDashboardLabelsEn,
    fixture: studentDashboardFixtureEn,
    onDemoAction: (message) => toast.message(message),
  },
};
