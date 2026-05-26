import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { Separator } from "../components/separator";

const meta = {
  title: "Patterns/PageHeader",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedHero: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl bg-background p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          All-Aboard
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          Feed communautaire
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          Parcourez les demandes d&apos;aide publiées par la communauté.
        </p>
        <div className="mt-4">
          <Button>Nouvelle demande</Button>
        </div>
      </header>
      <Separator />
    </div>
  ),
};

export const MentorHero: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl bg-background p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">Mentor</p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          Demandes à traiter
        </h1>
        <p className="m-0 text-muted-foreground">
          Connecté en tant que alice — demandes taguées mentor/domaine.
        </p>
      </header>
      <Separator />
    </div>
  ),
};

export const DetailHero: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl bg-background p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          Demande d&apos;aide
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          Comment structurer un monorepo Turborepo ?
        </h1>
        <p className="text-base text-muted-foreground">Auteur : bob · 26 mai 2026, 14:30</p>
      </header>
      <Separator />
    </div>
  ),
};
