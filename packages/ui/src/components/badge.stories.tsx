import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "mentor",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "rails",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "urgent",
  },
};

export const TagList: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 bg-background p-4">
      <Badge variant="secondary">mentor</Badge>
      <Badge variant="outline">rails</Badge>
      <Badge variant="outline">postgres</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 bg-background p-4">
      <Badge variant="default">default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="outline">outline</Badge>
      <Badge variant="destructive">destructive</Badge>
    </div>
  ),
};
