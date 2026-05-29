import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import { MobileBottomNav } from "./legacy-mobile-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Mobile",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function MobileNavStory(props: {
  messageCount?: number;
  showMentorDot?: boolean;
  activeLink?: "feed" | "explore" | "messages" | "profile";
}) {
  const labels = useLegacyLabels();
  return (
    <div className="relative min-h-40 w-full max-w-md">
      <MobileBottomNav labels={labels} {...props} />
    </div>
  );
}

export const MobileBottomNavDefault: Story = {
  name: "MobileBottomNav",
  decorators: [withPatternStoryFrame("full")],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => <MobileNavStory activeLink="feed" />,
};

export const MobileBottomNavWithUnreadBadge: Story = {
  name: "MobileBottomNav/WithUnreadBadge",
  decorators: [withPatternStoryFrame("full")],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <MobileNavStory activeLink="messages" messageCount={3} showMentorDot />
  ),
};
