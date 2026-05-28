import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="javascript">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Choisir un tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Technologies</SelectLabel>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="rails">Rails</SelectItem>
          <SelectItem value="react">React</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-[220px] gap-2">
      <Label htmlFor="tag-select">Tag principal</Label>
      <Select defaultValue="mentor">
        <SelectTrigger id="tag-select" className="w-full">
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mentor">Mentor</SelectItem>
          <SelectItem value="help">Aide</SelectItem>
          <SelectItem value="feedback">Feedback</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <Select defaultValue="sm">
      <SelectTrigger size="sm" className="w-[180px]">
        <SelectValue placeholder="Taille" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sm">Small</SelectItem>
        <SelectItem value="default">Default</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled defaultValue="javascript">
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Désactivé" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="javascript">JavaScript</SelectItem>
      </SelectContent>
    </Select>
  ),
};
