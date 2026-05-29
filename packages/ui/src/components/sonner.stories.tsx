import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import { toast } from "sonner";

import { useMvpPatternLabels } from "../i18n/storybook-locale";
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

function SuccessStory() {
  const labels = useMvpPatternLabels().toast;

  return (
    <Button onClick={() => toast.success(labels.success)}>
      {labels.successButton}
    </Button>
  );
}

function ErrorStory() {
  const labels = useMvpPatternLabels().toast;

  return (
    <Button
      variant="destructive"
      onClick={() => toast.error(labels.error)}
    >
      {labels.errorButton}
    </Button>
  );
}

function InfoStory() {
  const labels = useMvpPatternLabels().toast;

  return (
    <Button variant="outline" onClick={() => toast.info(labels.info)}>
      {labels.infoButton}
    </Button>
  );
}

function AllVariantsStory() {
  const labels = useMvpPatternLabels().toast;

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <Button onClick={() => toast.success(labels.successShort)}>
        {labels.successShort}
      </Button>
      <Button variant="destructive" onClick={() => toast.error(labels.errorShort)}>
        {labels.errorShort}
      </Button>
      <Button variant="outline" onClick={() => toast.warning(labels.warningShort)}>
        {labels.warningShort}
      </Button>
      <Button variant="secondary" onClick={() => toast.info(labels.infoShort)}>
        {labels.infoShort}
      </Button>
    </div>
  );
}

export const Success: Story = {
  render: () => <SuccessStory />,
};

export const Error: Story = {
  render: () => <ErrorStory />,
};

export const Info: Story = {
  render: () => <InfoStory />,
};

export const AllVariants: Story = {
  render: () => <AllVariantsStory />,
};
