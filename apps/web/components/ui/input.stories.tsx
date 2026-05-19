import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "Kit/§8.3 Input",
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => (
    <div className="max-w-sm space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="vous@exemple.fr" />
    </div>
  ),
};
