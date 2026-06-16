import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { useStorybookLocale } from "../i18n/storybook-locale";
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
  title: "Screens/UserDashboard",
  id: "screens-userdashboard",
  component: StudentDashboardScreen,
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta<typeof StudentDashboardScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StudentDashboardPreview({
  variant = "standalone",
}: {
  variant?: "standalone" | "content";
}) {
  const locale = useStorybookLocale();
  const labels =
    locale === "en" ? studentDashboardLabelsEn : studentDashboardLabelsFr;
  const fixture =
    locale === "en" ? studentDashboardFixtureEn : studentDashboardFixtureFr;

  return (
    <StudentDashboardScreen
      labels={labels}
      fixture={fixture}
      variant={variant}
      onDemoAction={(message) => toast.message(message)}
    />
  );
}

/** Full chrome — sidebar, header, footer. Locale via Storybook toolbar. */
export const Standalone: Story = {
  name: "Standalone",
  render: () => <StudentDashboardPreview />,
};

/** Main panels only — chrome from parent AppShell. */
export const ContentOnly: Story = {
  name: "Content (AppShell)",
  render: () => <StudentDashboardPreview variant="content" />,
};
