import type { Meta, StoryObj } from "@storybook/react";

import {
  useLegacyConversations,
  useLegacyLabels,
} from "../i18n/storybook-locale";
import {
  ConversationList,
  ConversationListItem,
  MessagesEmptyState,
  MessagesInboxLayout,
} from "./legacy-messages-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/Messages",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ConversationItemStory() {
  const labels = useLegacyLabels();
  const conversations = useLegacyConversations();
  return (
    <div className="w-full max-w-sm">
      <ConversationListItem conversation={conversations[0]} labels={labels} />
    </div>
  );
}

function ConversationItemUnreadStory() {
  const labels = useLegacyLabels();
  const conversations = useLegacyConversations();
  return (
    <div className="w-full max-w-sm">
      <ConversationListItem conversation={conversations[2]} labels={labels} />
    </div>
  );
}

function EmptyStateStory() {
  const labels = useLegacyLabels();
  return (
    <div className="flex h-64 w-full max-w-lg">
      <MessagesEmptyState labels={labels} />
    </div>
  );
}

function InboxLayoutStory() {
  const labels = useLegacyLabels();
  const conversations = useLegacyConversations();
  return (
    <div className="w-full">
      <MessagesInboxLayout conversations={conversations} labels={labels} />
    </div>
  );
}

function ConversationListStory() {
  const labels = useLegacyLabels();
  const conversations = useLegacyConversations();
  return (
    <div className="w-full max-w-sm">
      <ConversationList conversations={conversations} labels={labels} />
    </div>
  );
}

export const ConversationListItemDefault: Story = {
  name: "ConversationListItem",
  decorators: [withPatternStoryFrame()],
  render: () => <ConversationItemStory />,
};

export const ConversationListItemWithUnreadBadge: Story = {
  name: "ConversationListItem/WithUnreadBadge",
  decorators: [withPatternStoryFrame()],
  render: () => <ConversationItemUnreadStory />,
};

export const MessagesEmptyStateDefault: Story = {
  name: "MessagesEmptyState",
  decorators: [withPatternStoryFrame()],
  render: () => <EmptyStateStory />,
};

export const ConversationListDefault: Story = {
  name: "ConversationList",
  decorators: [withPatternStoryFrame()],
  render: () => <ConversationListStory />,
};

export const MessagesInboxLayoutDefault: Story = {
  name: "MessagesInbox/Layout",
  decorators: [withPatternStoryFrame("full")],
  render: () => <InboxLayoutStory />,
};
