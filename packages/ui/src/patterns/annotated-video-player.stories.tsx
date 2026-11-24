import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  AnnotatedVideoPlayer,
  annotatedVideoLabelsFr,
  type VideoAnnotationView,
} from "./annotated-video-player";
import { ChatComposer, chatComposerLabelsFr } from "./chat-composer";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const seed: VideoAnnotationView[] = [
  {
    id: "ann-1",
    atMs: 42_000,
    rect: { x: 0.55, y: 0.08, w: 0.3, h: 0.18 },
    authorName: "Alice Martin",
    body: "Tu as cliqué sur quoi ici ? Je ne vois pas ce bouton chez moi.",
    mine: false,
    resolved: false,
    deleted: false,
    edited: false,
    replies: [
      {
        id: "rep-1",
        authorName: "Bob Durand",
        body: "Le bouton Deploy, en haut à droite. Il faut être admin du projet.",
        mine: true,
        deleted: false,
        edited: false,
      },
    ],
  },
  {
    id: "ann-2",
    atMs: 125_000,
    authorName: "Bob Durand",
    body: "Ici le build démarre, ça prend une minute.",
    mine: true,
    resolved: true,
    deleted: false,
    edited: true,
    replies: [],
  },
];

/** Keeps annotations in memory so every action can be tried in Storybook. */
function Playground({ initial }: { initial: VideoAnnotationView[] }) {
  const [items, setItems] = useState(initial);
  const update = (id: string, change: Partial<VideoAnnotationView>) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...change } : a)));

  return (
    <AnnotatedVideoPlayer
      src=""
      durationMs={240_000}
      labels={annotatedVideoLabelsFr}
      annotations={items}
      unreadCount={1}
      onCreate={async (input) => {
        setItems((prev) =>
          [
            ...prev,
            {
              id: `ann-${Date.now()}`,
              ...input,
              authorName: "Bob Durand",
              mine: true,
              resolved: false,
              deleted: false,
              edited: false,
              replies: [],
            },
          ].sort((a, b) => a.atMs - b.atMs),
        );
      }}
      onReply={async (id, body) => {
        setItems((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  replies: [
                    ...a.replies,
                    {
                      id: `rep-${Date.now()}`,
                      authorName: "Bob Durand",
                      body,
                      mine: true,
                      deleted: false,
                      edited: false,
                    },
                  ],
                }
              : a,
          ),
        );
      }}
      onResolve={async (id, resolved) => update(id, { resolved })}
      onEdit={async (id, body) => update(id, { body, edited: true })}
      onDelete={async (id) => update(id, { body: undefined, deleted: true })}
      onEditReply={async () => {}}
      onDeleteReply={async () => {}}
    />
  );
}

const meta = {
  title: "Patterns/AnnotatedVideoPlayer",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame("form")],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAnnotations: Story = {
  name: "AnnotatedVideoPlayer/With annotations",
  render: () => <Playground initial={seed} />,
};

export const Empty: Story = {
  name: "AnnotatedVideoPlayer/Empty",
  render: () => <Playground initial={[]} />,
};

const composerBase = {
  labels: chatComposerLabelsFr,
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
  onInputChange: () => {},
  onCaptionChange: () => {},
  onSubmitText: () => {},
  onStart: () => {},
  onStop: () => {},
  onDiscard: () => {},
  onSendMedia: () => {},
};

export const ScreenSetup: Story = {
  name: "ChatComposer/Screen recording setup",
  render: () => {
    const [value, setValue] = useState({ microphone: true, screenAudio: true });
    return (
      <ChatComposer
        {...composerBase}
        phase="idle"
        screenSetup={value}
        onScreenSetupChange={setValue}
      />
    );
  },
};

export const ScreenRecordingWithoutScreenSound: Story = {
  name: "ChatComposer/Recording, no screen sound",
  render: () => (
    <ChatComposer
      {...composerBase}
      phase="recording"
      mode="screen"
      remainingMs={262_000}
      audioWarning="screen_audio_unavailable"
    />
  ),
};
