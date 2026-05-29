import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

import {
  PatternDemoCardShell,
  patternDemoAlertClassName,
} from "../patterns/pattern-story-frame";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert";
import { useAlertLabels } from "../i18n/storybook-locale";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Skeleton } from "../components/skeleton";
import { Textarea } from "../components/textarea";

const meta = {
  title: "Documentation/Catalog/Patterns",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function PatternSection({
  index,
  name,
  storyPath,
  children,
}: {
  index: number;
  name: string;
  storyPath: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border px-6 py-10 last:border-b-0">
      <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
        {String(index).padStart(2, "0")} · Pattern
      </p>
      <h2 className="mt-2 mb-1 text-2xl font-semibold text-foreground">{name}</h2>
      <p className="mb-6 text-xs text-muted-foreground">
        Détail : <code className="text-foreground">{storyPath}</code>
      </p>
      <div className="max-w-2xl">{children}</div>
    </section>
  );
}

export const ListingPatterns: Story = {
  name: "00 · Listing patterns",
  render: () => (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="m-0 text-3xl font-semibold text-foreground">Catalogue patterns</h1>
      <p className="mt-2 text-muted-foreground">
        Six compositions alignées sur <code className="text-foreground">apps/web</code>.
        Entrées <strong className="text-foreground">01…06</strong> dans la sidebar.
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>EmptyState</li>
        <li>ErrorAlert</li>
        <li>FeedItemCard</li>
        <li>FormField</li>
        <li>PageHeader</li>
        <li>LoadingFeed</li>
      </ol>
    </div>
  ),
};

export const EmptyStatePattern: Story = {
  name: "01 · EmptyState",
  render: () => (
    <div className="p-8">
      <PatternSection index={1} name="EmptyState" storyPath="Patterns/EmptyState">
        <PatternDemoCardShell>
          <p className="m-0 text-lg font-semibold">Aucune demande pour l&apos;instant</p>
          <p className="m-0 text-sm text-muted-foreground">Soyez le premier à publier.</p>
          <Button variant="outline">Publier une demande</Button>
        </PatternDemoCardShell>
      </PatternSection>
    </div>
  ),
};

export const ErrorAlertPattern: Story = {
  name: "02 · ErrorAlert",
  render: () => {
    const labels = useAlertLabels();

    return (
      <div className="p-8">
        <PatternSection index={2} name="ErrorAlert" storyPath="Patterns/ErrorAlert">
          <Alert variant="destructive" className={patternDemoAlertClassName}>
            <AlertTitle>{labels.feedLoadError}</AlertTitle>
            <AlertDescription>{labels.http502}</AlertDescription>
          </Alert>
        </PatternSection>
      </div>
    );
  },
};

export const FeedItemCardPattern: Story = {
  name: "03 · FeedItemCard",
  render: () => (
    <div className="p-8">
      <PatternSection index={3} name="FeedItemCard" storyPath="Patterns/FeedItemCard">
        <PatternDemoCardShell className="hover:border-primary/50">
          <p className="m-0 text-lg font-semibold">Comment structurer un monorepo ?</p>
          <p className="m-0 text-sm text-muted-foreground">Auteur : bob</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">mentor</Badge>
            <Badge variant="outline">turborepo</Badge>
          </div>
        </PatternDemoCardShell>
      </PatternSection>
    </div>
  ),
};

export const FormFieldPattern: Story = {
  name: "04 · FormField",
  render: () => (
    <div className="p-8">
      <PatternSection index={4} name="FormField" storyPath="Patterns/FormField">
        <div className="grid max-w-md gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-user">Identifiant</Label>
            <Input id="p-user" defaultValue="bob" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-title">Titre</Label>
            <Textarea id="p-title" rows={2} />
          </div>
          <Button className="w-full">Connexion et publier</Button>
        </div>
      </PatternSection>
    </div>
  ),
};

export const PageHeaderPattern: Story = {
  name: "05 · PageHeader",
  render: () => (
    <div className="p-8">
      <PatternSection index={5} name="PageHeader" storyPath="Patterns/PageHeader">
        <header>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            All-Aboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Feed communautaire</h1>
          <p className="text-muted-foreground">Description de page.</p>
        </header>
      </PatternSection>
    </div>
  ),
};

export const LoadingFeedPattern: Story = {
  name: "06 · LoadingFeed",
  render: () => (
    <div className="p-8">
      <PatternSection index={6} name="LoadingFeed" storyPath="Patterns/LoadingFeed">
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </PatternSection>
    </div>
  ),
};
