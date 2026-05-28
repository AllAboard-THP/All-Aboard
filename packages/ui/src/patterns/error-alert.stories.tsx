import type { Meta, StoryObj } from "@storybook/react";

import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import {
  patternDemoAlertClassName,
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/ErrorAlert",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedLoadError: Story = {
  render: () => (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>Impossible de charger le feed</AlertTitle>
      <AlertDescription>Feed HTTP 502</AlertDescription>
    </Alert>
  ),
};

export const DetailLoadError: Story = {
  render: () => (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>Impossible de charger la demande</AlertTitle>
      <AlertDescription>not_found</AlertDescription>
    </Alert>
  ),
};

export const AuthRequired: Story = {
  render: () => (
    <Alert className={patternDemoAlertClassName}>
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
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>Accès réservé aux mentors</AlertTitle>
      <AlertDescription>
        Ce tableau de bord est réservé aux comptes mentor (MVP).
      </AlertDescription>
    </Alert>
  ),
};
