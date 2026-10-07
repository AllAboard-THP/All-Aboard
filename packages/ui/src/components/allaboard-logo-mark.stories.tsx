import type { Meta, StoryObj } from "@storybook/react";

import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";
import { AllAboardLogoMark } from "./allaboard-logo-mark";

const meta = {
  title: "Components/AllAboardLogoMark",
  component: AllAboardLogoMark,
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta<typeof AllAboardLogoMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <AllAboardLogoMark />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <AllAboardLogoMark className="size-6" />
      <AllAboardLogoMark className="size-10" />
      <AllAboardLogoMark className="size-16" />
    </div>
  ),
};
