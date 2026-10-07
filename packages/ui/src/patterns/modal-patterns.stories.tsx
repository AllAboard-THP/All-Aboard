import type { Meta, StoryObj } from "@storybook/react";

import { useLegacyLabels } from "../i18n/storybook-locale";
import {
  CguAcceptanceModal,
  CreatePostModal,
  SubjectRequestModal,
} from "./legacy-modal-patterns";
import { patternStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Patterns/Modals",
  parameters: {
    ...patternStoryParameters,
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function CreatePostModalStory() {
  const labels = useLegacyLabels();
  return <CreatePostModal defaultOpen labels={labels} />;
}

function SubjectRequestModalStory() {
  const labels = useLegacyLabels();
  return <SubjectRequestModal defaultOpen labels={labels} />;
}

function CguPendingStory() {
  const labels = useLegacyLabels();
  return <CguAcceptanceModal defaultOpen labels={labels} />;
}

function CguAcceptedStory() {
  const labels = useLegacyLabels();
  return <CguAcceptanceModal defaultOpen accepted labels={labels} />;
}

export const CreatePostModalOpen: Story = {
  name: "CreatePostModal",
  render: () => <CreatePostModalStory />,
};

export const SubjectRequestModalOpen: Story = {
  name: "SubjectRequestModal",
  render: () => <SubjectRequestModalStory />,
};

export const CguAcceptanceModalPending: Story = {
  name: "CguAcceptanceModal/Pending",
  render: () => <CguPendingStory />,
};

export const CguAcceptanceModalAccepted: Story = {
  name: "CguAcceptanceModal/Accepted",
  render: () => <CguAcceptedStory />,
};
