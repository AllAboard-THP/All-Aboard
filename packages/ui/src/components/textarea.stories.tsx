import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Décrivez votre demande d'aide…",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Champ désactivé",
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2 p-4">
      <Label htmlFor="help-description">Description</Label>
      <Textarea
        id="help-description"
        placeholder="Contexte, ce que vous avez déjà essayé…"
        rows={4}
      />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2 p-4">
      <Label htmlFor="invalid-textarea">Description</Label>
      <Textarea
        id="invalid-textarea"
        aria-invalid={true}
        defaultValue="Trop court"
      />
      <p className="m-0 text-sm text-destructive">
        Minimum 20 caractères pour publier.
      </p>
    </div>
  ),
};
