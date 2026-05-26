import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Email",
    type: "email",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 bg-background p-4">
      <label htmlFor="email" className="text-sm font-medium text-foreground">
        Email
      </label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};
