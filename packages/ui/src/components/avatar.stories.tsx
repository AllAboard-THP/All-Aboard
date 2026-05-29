import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarFallback>HB</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar size="lg">
      <AvatarImage
        src="https://api.dicebear.com/9.x/avataaars/svg?seed=Hugo"
        alt="Inès P."
      />
      <AvatarFallback>HB</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="sm">
        <AvatarFallback>S</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>L</AvatarFallback>
      </Avatar>
    </div>
  ),
};
