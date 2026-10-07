import type { Meta, StoryObj } from "@storybook/react-vite";

import { LegalCguButton } from "./legal-cgu-button";

const meta = {
  title: "Components/LegalCguButton",
  component: LegalCguButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LegalCguButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "LegalCguButton",
  args: {
    label: "CGU",
    onClick: () => undefined,
  },
};
