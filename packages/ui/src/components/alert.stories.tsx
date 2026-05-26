import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className="w-full max-w-lg">
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Message informatif pour l&apos;utilisateur.
      </AlertDescription>
    </Alert>
  ),
};

export const ConnexionRequise: Story = {
  render: () => (
    <Alert className="w-full max-w-lg">
      <AlertTitle>Connexion requise</AlertTitle>
      <AlertDescription>
        Connectez-vous via{" "}
        <span className="text-primary underline">Nouvelle demande</span> pour
        accéder au dashboard mentor.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-full max-w-lg">
      <AlertTitle>Impossible de charger le feed</AlertTitle>
      <AlertDescription>Feed HTTP 502</AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-4 bg-background p-4">
      <Alert>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Message informatif neutre.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Impossible de charger le feed</AlertTitle>
        <AlertDescription>Feed HTTP 502</AlertDescription>
      </Alert>
    </div>
  ),
};
