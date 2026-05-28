import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import {
  PatternDemoCardShell,
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/EmptyState",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedEmpty: Story = {
  render: () => (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">Aucune demande pour l&apos;instant</p>
      <p className="m-0 text-sm text-muted-foreground">
        Soyez le premier à publier une demande d&apos;aide.
      </p>
      <Button variant="outline">Publier une demande</Button>
    </PatternDemoCardShell>
  ),
};

export const ResponsesEmpty: Story = {
  render: () => (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">Aucune réponse pour l&apos;instant</p>
      <p className="m-0 text-sm text-muted-foreground">
        Les mentors pourront répondre lorsque la demande sera visible.
      </p>
    </PatternDemoCardShell>
  ),
};

export const NotFound: Story = {
  render: () => (
    <PatternDemoCardShell>
      <p className="m-0 text-2xl font-semibold">Demande introuvable</p>
      <p className="m-0 text-sm text-muted-foreground">
        Aucune demande ne correspond à{" "}
        <span className="whitespace-nowrap">
          l&apos;identifiant <code className="text-foreground">req-unknown</code>.
        </span>
      </p>
      <Button variant="outline">Retour au feed</Button>
    </PatternDemoCardShell>
  ),
};

export const MentorFeedEmpty: Story = {
  render: () => (
    <PatternDemoCardShell>
      <p className="m-0 text-lg font-semibold">Aucune demande taguée</p>
      <p className="m-0 text-sm text-muted-foreground">
        Les demandes avec des tags mentor ou domaine apparaîtront ici.
      </p>
    </PatternDemoCardShell>
  ),
};
