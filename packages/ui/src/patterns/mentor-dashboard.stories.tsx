import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { useStorybookLocale } from "../i18n/storybook-locale";
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

function useMentorDashboardStoryProps() {
  const locale = useStorybookLocale();
  return {
    locale,
    labels:
      locale === "en" ? mentorDashboardLabelsEn : mentorDashboardLabelsFr,
    fixture:
      locale === "en" ? mentorDashboardFixtureEn : mentorDashboardFixtureFr,
  };
}

function MentorDashboardPreview() {
  const { labels, fixture, locale } = useMentorDashboardStoryProps();

  return (
    <MentorDashboardScreen
      labels={labels}
      fixture={fixture}
      locale={locale}
      onDemoAction={(message) => toast.message(message)}
    />
  );
}

function MentorDashboardContentPreview() {
  const { labels, fixture, locale } = useMentorDashboardStoryProps();

  return (
    <MentorDashboardScreen
      labels={labels}
      fixture={fixture}
      locale={locale}
      variant="content"
      onDemoAction={(message) => toast.message(message)}
    />
  );
}

/** Full chrome — sidebar, header, footer. Locale via Storybook toolbar. */
export const Standalone: Story = {
  name: "Standalone",
  render: () => <MentorDashboardPreview />,
};

export const ContentOnly: Story = {
  name: "Content (AppShell)",
  render: () => <MentorDashboardContentPreview />,
};
