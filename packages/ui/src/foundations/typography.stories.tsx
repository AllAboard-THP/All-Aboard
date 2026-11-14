import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Foundations/Typography",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Échelle titres</h2>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-foreground">Heading 1 — Feed communautaire</h1>
          <h2 className="text-3xl font-semibold text-foreground">Heading 2 — Publier une demande</h2>
          <h3 className="text-2xl font-semibold text-foreground">Heading 3 — Section réponses</h3>
          <h4 className="text-lg font-semibold text-foreground">Heading 4 — Titre carte feed</h4>
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Corps & labels</h2>
        <p className="text-base text-foreground">
          Corps par défaut — parcours Bob, descriptions de feed et formulaires.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Texte secondaire — métadonnées auteur, dates, hints MVP.
        </p>
        <p className="mt-4 text-xs font-bold tracking-widest text-primary uppercase">
          Eyebrow — All-Aboard · Mentor · Nouvelle demande
        </p>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Inline</h2>
        <p className="text-sm text-foreground">
          Lien{" "}
          <span className="font-semibold text-primary underline">Nouvelle demande</span> · code{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-foreground">/api/feed</code>
        </p>
      </div>
    </div>
  ),
};
