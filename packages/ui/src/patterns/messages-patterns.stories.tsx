import type { Meta, StoryObj } from "@storybook/react";

import type { RecordedMedia } from "../hooks/media-recorder";
import {
  useLegacyConversations,
  useLegacyLabels,
} from "../i18n/storybook-locale";
import {
  ChatComposer,
  chatComposerLabelsFr,
  type ChatComposerProps,
} from "./chat-composer";
import {
  AudioBubble,
  VideoBubble,
  chatBubbleLabelsFr,
} from "./chat-message-bubbles";
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

const bubbleLabels = chatBubbleLabelsFr;

const mockAudioUrl = "https://example.com/fixtures/voice-message.webm";
const mockVideoUrl = "https://example.com/fixtures/video-message.webm";

const previewAudio: RecordedMedia = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  mimeType: "audio/webm",
  durationMs: 12_000,
  source: "microphone",
  kind: "audio",
  previewUrl: mockAudioUrl,
};

const composerActions = {
  onInputChange: () => {},
  onCaptionChange: () => {},
  onSubmitText: () => {},
  onStart: () => {},
  onStop: () => {},
  onDiscard: () => {},
  onSendMedia: () => {},
} satisfies Pick<
  ChatComposerProps,
  | "onInputChange"
  | "onCaptionChange"
  | "onSubmitText"
  | "onStart"
  | "onStop"
  | "onDiscard"
  | "onSendMedia"
>;

function composerProps(
  overrides: Partial<ChatComposerProps> = {},
): ChatComposerProps {
  return {
    labels: chatComposerLabelsFr,
    phase: "idle",
    mode: null,
    remainingMs: 0,
    error: null,
    recording: null,
    screenCaptureSupported: true,
    input: "",
    caption: "",
    uploadProgress: 0,
    uploadError: null,
    textError: null,
    sendingText: false,
    ...composerActions,
    ...overrides,
  };
}

export const AudioBubbleDefault: Story = {
  name: "AudioBubble",
  decorators: [withPatternStoryFrame()],
  render: () => (
    <div className="w-full max-w-sm">
      <AudioBubble
        src={mockAudioUrl}
        durationMs={12_000}
        caption="On se retrouve après le cours."
        labels={bubbleLabels}
      />
    </div>
  ),
};

export const AudioBubbleSending: Story = {
  name: "AudioBubble/Sending",
  decorators: [withPatternStoryFrame()],
  render: () => (
    <div className="w-full max-w-sm">
      <AudioBubble
        src={mockAudioUrl}
        durationMs={12_000}
        pending
        mine
        labels={bubbleLabels}
      />
    </div>
  ),
};

export const VideoBubbleDefault: Story = {
  name: "VideoBubble",
  decorators: [withPatternStoryFrame()],
  render: () => (
    <div className="w-full max-w-md">
      <VideoBubble
        src={mockVideoUrl}
        durationMs={8_000}
        caption="Regarde l'écran, le bug est ici."
        labels={bubbleLabels}
      />
    </div>
  ),
};

export const ChatComposerIdle: Story = {
  name: "ChatComposer/Idle",
  decorators: [withPatternStoryFrame("form")],
  render: () => <ChatComposer {...composerProps({ input: "Bonjour !" })} />,
};

export const ChatComposerRecording: Story = {
  name: "ChatComposer/Recording",
  decorators: [withPatternStoryFrame("form")],
  render: () => (
    <ChatComposer
      {...composerProps({
        phase: "recording",
        mode: "microphone",
        remainingMs: 240_000,
      })}
    />
  ),
};

export const ChatComposerPreview: Story = {
  name: "ChatComposer/Preview",
  decorators: [withPatternStoryFrame("form")],
  render: () => (
    <ChatComposer
      {...composerProps({
        phase: "preview",
        mode: "microphone",
        recording: previewAudio,
        caption: "Petit vocal",
      })}
    />
  ),
};

export const ChatComposerUploading: Story = {
  name: "ChatComposer/Uploading",
  decorators: [withPatternStoryFrame("form")],
  render: () => (
    <ChatComposer
      {...composerProps({
        phase: "uploading",
        mode: "microphone",
        recording: previewAudio,
        uploadProgress: 45,
      })}
    />
  ),
};
