import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";

import { useStorybookLocale } from "../i18n/storybook-locale";
import { AppSidebarProvider } from "./app-sidebar-provider";
import { AppChromeSidebar } from "./app-chrome-sidebar";
import {
  studentDashboardFixtureEn,
  studentDashboardFixtureFr,
} from "./fixtures/student-dashboard";
import {
  studentDashboardLabelsEn,
  studentDashboardLabelsFr,
} from "./student-dashboard-labels";
import { StudentDashboardScreen } from "./student-dashboard-screen";
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Patterns/AppShellComposition",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function StudentDashboardInShellStory() {
  const locale = useStorybookLocale();
  const labels =
    locale === "en" ? studentDashboardLabelsEn : studentDashboardLabelsFr;
  const fixture =
    locale === "en" ? studentDashboardFixtureEn : studentDashboardFixtureFr;

  return (
    <AppSidebarProvider>
      <div className="app-stage relative flex min-h-[100dvh] flex-col">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <AppChromeSidebar activeId="dashboard" />
          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <StudentDashboardScreen
              labels={labels}
              fixture={fixture}
              variant="content"
              onDemoAction={(message) => toast.message(message)}
            />
          </main>
        </div>
      </div>
    </AppSidebarProvider>
  );
}

/** Sidebar rail + dashboard content only — mirrors `(app)/layout` main slot. */
export const StudentDashboardContent: Story = {
  name: "StudentDashboardContent",
  render: () => <StudentDashboardInShellStory />,
};
