import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "../components/alert";

const meta = {
  title: "Patterns/ErrorAlert",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedLoadError: Story = {
  render: () => (
    <Alert variant="destructive" className="w-full max-w-3xl">
      <AlertTitle>Impossible de charger le feed</AlertTitle>
      <AlertDescription>Feed HTTP 502</AlertDescription>
    </Alert>
  ),
};

export const DetailLoadError: Story = {
  render: () => (
    <Alert variant="destructive" className="w-full max-w-3xl">
      <AlertTitle>Impossible de charger la demande</AlertTitle>
      <AlertDescription>not_found</AlertDescription>
    </Alert>
  ),
};

export const AuthRequired: Story = {
  render: () => (
    <Alert className="w-full max-w-3xl">
      <AlertTitle>Connexion requise</AlertTitle>
      <AlertDescription>
        Connectez-vous via{" "}
        <span className="text-primary underline">Nouvelle demande</span> pour
        accéder au dashboard mentor.
      </AlertDescription>
    </Alert>
  ),
};

export const MentorForbidden: Story = {
  render: () => (
    <Alert variant="destructive" className="w-full max-w-3xl">
      <AlertTitle>Accès réservé aux mentors</AlertTitle>
      <AlertDescription>
        Ce tableau de bord est réservé aux comptes mentor (MVP).
      </AlertDescription>
    </Alert>
  ),
};
