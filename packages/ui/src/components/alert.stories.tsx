import type { Meta, StoryObj } from "@storybook/react";

import {
  patternDemoAlertClassName,
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert className={patternDemoAlertClassName}>
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Message informatif pour l&apos;utilisateur.
      </AlertDescription>
    </Alert>
  ),
};

export const ConnexionRequise: Story = {
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

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className={patternDemoAlertClassName}>
      <AlertTitle>Impossible de charger le feed</AlertTitle>
      <AlertDescription>Feed HTTP 502</AlertDescription>
    </Alert>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-4">
      <Alert className={patternDemoAlertClassName}>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>Message informatif neutre.</AlertDescription>
      </Alert>
      <Alert variant="destructive" className={patternDemoAlertClassName}>
        <AlertTitle>Impossible de charger le feed</AlertTitle>
        <AlertDescription>Feed HTTP 502</AlertDescription>
      </Alert>
    </div>
  ),
};
