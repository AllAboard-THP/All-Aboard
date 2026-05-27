import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

const meta = {
  title: "Components/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Story />
        <Toaster />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success("Demande publiée avec succès")}>
      Toast succès
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error("Impossible de publier la demande")}
    >
      Toast erreur
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.info("Session mentor active")}>
      Toast info
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 bg-background p-4">
      <Button onClick={() => toast.success("Succès")}>Succès</Button>
      <Button variant="destructive" onClick={() => toast.error("Erreur")}>
        Erreur
      </Button>
      <Button variant="outline" onClick={() => toast.warning("Attention")}>
        Warning
      </Button>
      <Button variant="secondary" onClick={() => toast.info("Info")}>
        Info
      </Button>
    </div>
  ),
};
