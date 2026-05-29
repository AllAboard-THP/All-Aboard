import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels, usePostCardLabels } from "../i18n/storybook-locale";
import {
  CommentCard,
  FeedSearchCard,
  FeedSidebarContributions,
  FeedSidebarRecentEmpty,
  FeedSidebarUnanswered,
  QuickReply,
  ScrollToTopFab,
  SidebarEmptyState,
  SidebarPanel,
  UnansweredListItem,
} from "./legacy-feed-patterns";
import { legacySubjects } from "./fixtures/legacy-subjects";
import { History } from "lucide-react";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Feed",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function CommentCardStory() {
  const labels = usePostCardLabels();
  return (
    <div className="w-full max-w-xl">
      <CommentCard
        authorName="Yann L."
        authorInitials="YL"
        timeAgo="il y a 1 h"
        body="Essaie de retirer data des deps ou de mémoriser fetchData avec useCallback."
        code={{
          language: "javascript",
          snippet: "const fetchData = useCallback(() => {...}, []);",
        }}
      />
      <span className="sr-only">{labels.copy}</span>
    </div>
  );
}

function QuickReplyStory() {
  const labels = useLegacyLabels();
  return (
    <div className="w-full max-w-xl">
      <QuickReply
        placeholder={labels.feed.quickReplyPlaceholder}
        submitLabel={labels.feed.quickReplySubmit}
      />
    </div>
  );
}

export const CommentCardDefault: Story = {
  name: "CommentCard",
  decorators: [withPatternStoryFrame()],
  render: () => <CommentCardStory />,
};

export const QuickReplyDefault: Story = {
  name: "QuickReply",
  decorators: [withPatternStoryFrame()],
  render: () => <QuickReplyStory />,
};

export const SidebarPanelEmpty: Story = {
  name: "SidebarPanel/Empty",
  decorators: [withPatternStoryFrame()],
  render: () => <FeedSidebarRecentEmpty />,
};

export const SidebarPanelUnanswered: Story = {
  name: "SidebarPanel/Unanswered",
  decorators: [withPatternStoryFrame()],
  render: () => <FeedSidebarUnanswered />,
};

export const FeedSearchCardDefault: Story = {
  name: "FeedSearchCard",
  decorators: [withPatternStoryFrame()],
  render: () => <FeedSearchCard />,
};

export const ContributionListItemDefault: Story = {
  name: "ContributionListItem",
  decorators: [withPatternStoryFrame()],
  render: () => <FeedSidebarContributions />,
};

export const ScrollToTopFabVisible: Story = {
  name: "ScrollToTopFab",
  decorators: [withPatternStoryFrame("full")],
  render: () => {
    const labels = useLegacyLabels();
    return <ScrollToTopFab ariaLabel={labels.feed.scrollTop} visible />;
  },
};

export const UnansweredItem: Story = {
  name: "UnansweredListItem",
  decorators: [withPatternStoryFrame()],
  render: () => {
    const subject = legacySubjects[1];
    return (
      <div className="w-full max-w-sm">
        <SidebarPanel title="Sans réponse" icon={History}>
          <UnansweredListItem
            title="Problème avec React useEffect"
            authorName="Camille R."
            authorInitials="CR"
            subjectName={subject.name}
            accentColor={subject.accentColor}
            timeAgo="2 h"
          />
        </SidebarPanel>
      </div>
    );
  },
};

export const SidebarEmpty: Story = {
  name: "SidebarEmptyState",
  decorators: [withPatternStoryFrame()],
  render: () => {
    const labels = useLegacyLabels();
    return (
      <div className="w-full max-w-sm">
        <SidebarPanel title={labels.feed.recentTitle} icon={History}>
          <SidebarEmptyState message={labels.feed.recentEmpty} />
        </SidebarPanel>
      </div>
    );
  },
};
