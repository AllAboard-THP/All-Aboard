import type { Meta, StoryObj } from "@storybook/react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";

const meta = {
  title: "Patterns/FormField",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
        <Textarea
          id="pattern-title"
          rows={3}
          placeholder="Décrivez votre problème en une ou plusieurs phrases"
        />
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
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>Identifiants invalides.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const DuplicateError: Story = {
  render: () => (
    <Alert variant="destructive" className="w-full max-w-md">
      <AlertTitle>Doublon détecté (MOC)</AlertTitle>
      <AlertDescription>
        <span className="font-medium text-primary underline">
          Voir la demande existante
        </span>
      </AlertDescription>
    </Alert>
  ),
};

export const RubberduckHint: Story = {
  render: () => (
    <Alert className="w-full max-w-md">
      <AlertTitle>Rubberduck (stub)</AlertTitle>
      <AlertDescription>
        Titre court — piste IA possible (Phase 4). Publiez une nouvelle demande
        ou consultez le feed.
      </AlertDescription>
    </Alert>
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
