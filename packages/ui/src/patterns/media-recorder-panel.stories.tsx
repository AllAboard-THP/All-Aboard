import type { Meta, StoryObj } from "@storybook/react";

import type { RecordedMedia } from "../hooks/media-recorder";
import {
  MediaRecorderPanel,
  MediaRecorderSession,
  mediaRecorderPanelLabelsFr,
} from "./media-recorder-panel";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const labels = mediaRecorderPanelLabelsFr;

const previewAudio: RecordedMedia = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  mimeType: "audio/webm",
  durationMs: 12_000,
  source: "microphone",
  kind: "audio",
  previewUrl: "",
};

const previewVideo: RecordedMedia = {
  blob: new Blob(["video"], { type: "video/webm" }),
  mimeType: "video/webm",
  durationMs: 8_000,
  source: "camera",
  kind: "video",
  previewUrl: "",
};

const meta = {
  title: "Patterns/MediaRecorder",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame("form")],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const idleActions = {
  onStart: () => {},
  onStop: () => {},
  onDiscard: () => {},
  onAccept: () => {},
};

export const Idle: Story = {
  name: "MediaRecorderPanel/Idle",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="idle"
      mode={null}
      remainingMs={0}
      error={null}
      recording={null}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const RecordingAudio: Story = {
  name: "MediaRecorderPanel/RecordingAudio",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="recording"
      mode="microphone"
      remainingMs={240_000}
      error={null}
      recording={null}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const RecordingCamera: Story = {
  name: "MediaRecorderPanel/RecordingCamera",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="recording"
      mode="camera"
      remainingMs={90_000}
      error={null}
      recording={null}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const PreviewAudio: Story = {
  name: "MediaRecorderPanel/PreviewAudio",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="preview"
      mode="microphone"
      remainingMs={0}
      error={null}
      recording={previewAudio}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const PreviewVideo: Story = {
  name: "MediaRecorderPanel/PreviewVideo",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="preview"
      mode="camera"
      remainingMs={0}
      error={null}
      recording={previewVideo}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const PermissionDenied: Story = {
  name: "MediaRecorderPanel/PermissionDenied",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="error"
      mode="microphone"
      remainingMs={0}
      error="permission_denied"
      recording={null}
      screenCaptureSupported
      {...idleActions}
    />
  ),
};

export const ScreenUnsupported: Story = {
  name: "MediaRecorderPanel/ScreenUnsupported",
  render: () => (
    <MediaRecorderPanel
      labels={labels}
      phase="idle"
      mode={null}
      remainingMs={0}
      error={null}
      recording={null}
      screenCaptureSupported={false}
      {...idleActions}
    />
  ),
};

export const Interactive: Story = {
  name: "MediaRecorderSession/Interactive",
  render: () => <MediaRecorderSession labels={labels} />,
};
