import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { LandingPublicHeader } from "./landing-public-header";
import { AppFooter, AppNavBar, StatCard, UserMenu } from "./legacy-ui";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/App Chrome",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function FooterStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-7xl px-4">
      <AppFooter labels={labels} />
    </div>
  );
}

function NavStory() {
  const labels = useLegacyLabels();
  return <AppNavBar activeLink="resources" messageCount={3} labels={labels} />;
}

function LandingHeaderStory() {
  const labels = useLegacyLabels();
  return <LandingPublicHeader labels={labels} />;
}

function UserMenuStory() {
  const labels = useLegacyLabels();
  return (
    <div className="flex justify-end p-8">
      <UserMenu
        userName="Admin AllAboard"
        userInitials="AA"
        isAdmin
        defaultOpen
        labels={labels}
      />
    </div>
  );
}

function StatCardsStory() {
  const labels = useLegacyLabels();
  const isEn = labels.nav.feed === "Home";

  return (
    <div className="grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
      <StatCard value={128} label={isEn ? "Users" : "Utilisateurs"} tone="primary" />
      <StatCard value={14} label={isEn ? "Pending" : "En attente"} tone="orange" />
      <StatCard value={6} label={isEn ? "Reports" : "Signalements"} tone="yellow" />
    </div>
  );
}

export const AppFooterDefault: Story = {
  name: "AppFooter",
  decorators: [withPatternStoryFrame("full")],
  render: () => <FooterStory />,
};

export const AppNavBarDefault: Story = {
  name: "AppNavBar",
  decorators: [withPatternStoryFrame("full")],
  render: () => <NavStory />,
};

export const LandingPublicHeaderDefault: Story = {
  name: "LandingPublicHeader",
  decorators: [withPatternStoryFrame("full")],
  render: () => <LandingHeaderStory />,
};

export const UserMenuOpen: Story = {
  name: "UserMenu",
  decorators: [withPatternStoryFrame()],
  render: () => <UserMenuStory />,
};

export const StatCardRow: Story = {
  name: "StatCard",
  decorators: [withPatternStoryFrame()],
  render: () => <StatCardsStory />,
};
