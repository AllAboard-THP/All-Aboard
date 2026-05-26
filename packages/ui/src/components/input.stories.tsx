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

export const Invalid: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 bg-background p-4">
      <Input
        id="invalid-field"
        type="text"
        placeholder="Titre"
        aria-invalid={true}
        defaultValue=""
      />
      <p className="m-0 text-sm text-destructive">
        Le titre doit contenir au moins 3 caractères.
      </p>
    </div>
  ),
};

export const InvalidWithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 bg-background p-4">
      <label htmlFor="invalid-title" className="text-sm font-medium text-foreground">
        Titre
      </label>
      <Input
        id="invalid-title"
        type="text"
        placeholder="Décrivez votre demande"
        aria-invalid={true}
      />
      <p className="m-0 text-sm text-destructive">
        Le titre doit contenir au moins 3 caractères.
      </p>
    </div>
  ),
};
