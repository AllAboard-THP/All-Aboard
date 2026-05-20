import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 bg-background p-4">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Your name" />
    </div>
  ),
};

export const DisabledField: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 bg-background p-4">
      <Label htmlFor="disabled-input">Disabled field</Label>
      <Input id="disabled-input" placeholder="Unavailable" disabled />
    </div>
  ),
};
