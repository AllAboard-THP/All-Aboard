import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";

const meta = {
  title: "Patterns/FormField",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const HelpRequestFields: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-4 bg-background p-4">
      <div className="grid gap-2">
        <Label htmlFor="pattern-user-id">Identifiant utilisateur</Label>
        <Input id="pattern-user-id" defaultValue="bob" autoComplete="username" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-password">Mot de passe MVP</Label>
        <Input
          id="pattern-password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-title">Titre de la demande</Label>
        <Input id="pattern-title" placeholder="Résumer en une phrase" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pattern-tags">Tags (optionnel)</Label>
        <Input id="pattern-tags" placeholder="mentor, rails" />
      </div>
      <Button className="w-full">Connexion et publier</Button>
    </div>
  ),
};

export const InlineError: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-2 bg-background p-4">
      <Label htmlFor="pattern-invalid-login">Mot de passe MVP</Label>
      <Input
        id="pattern-invalid-login"
        type="password"
        aria-invalid={true}
      />
      <p className="m-0 text-sm text-destructive">Identifiants invalides.</p>
    </div>
  ),
};

export const TextareaField: Story = {
  render: () => (
    <div className="grid w-full max-w-md gap-2 bg-background p-4">
      <Label htmlFor="pattern-description">Description détaillée</Label>
      <Textarea
        id="pattern-description"
        rows={4}
        placeholder="Contexte, étapes déjà tentées…"
      />
    </div>
  ),
};
