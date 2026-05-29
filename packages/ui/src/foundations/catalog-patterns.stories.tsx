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
import { useAlertLabels, useMvpPatternLabels } from "../i18n/storybook-locale";
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
  const labels = useMvpPatternLabels().catalog;

  return (
    <section className="border-b border-border px-6 py-10 last:border-b-0">
      <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
        {String(index).padStart(2, "0")} · Pattern
      </p>
      <h2 className="mt-2 mb-1 text-2xl font-semibold text-foreground">{name}</h2>
      <p className="mb-6 text-xs text-muted-foreground">
        {labels.detailPrefix}{" "}
        <code className="text-foreground">{storyPath}</code>
      </p>
      <div className="max-w-2xl">{children}</div>
    </section>
  );
}

function ListingPatternsStory() {
  const labels = useMvpPatternLabels().catalog;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="m-0 text-3xl font-semibold text-foreground">
        {labels.patternsListingTitle}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {labels.patternsListingLead}{" "}
        <code className="text-foreground">{labels.patternsListingStrong}</code>
        {labels.patternsListingTail}
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
  );
}

function EmptyStatePatternStory() {
  const empty = useMvpPatternLabels().emptyState;

  return (
    <div className="p-8">
      <PatternSection index={1} name="EmptyState" storyPath="Patterns/EmptyState">
        <PatternDemoCardShell>
          <p className="m-0 text-lg font-semibold">{empty.feedTitle}</p>
          <p className="m-0 text-sm text-muted-foreground">
            {empty.catalogDescription}
          </p>
          <Button variant="outline">{empty.feedCta}</Button>
        </PatternDemoCardShell>
      </PatternSection>
    </div>
  );
}

function ErrorAlertPatternStory() {
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
}

function FeedItemCardPatternStory() {
  const labels = useMvpPatternLabels().catalog;

  return (
    <div className="p-8">
      <PatternSection index={3} name="FeedItemCard" storyPath="Patterns/FeedItemCard">
        <PatternDemoCardShell className="hover:border-primary/50">
          <p className="m-0 text-lg font-semibold">{labels.feedItemTitle}</p>
          <p className="m-0 text-sm text-muted-foreground">{labels.feedItemAuthor}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">mentor</Badge>
            <Badge variant="outline">turborepo</Badge>
          </div>
        </PatternDemoCardShell>
      </PatternSection>
    </div>
  );
}

function FormFieldPatternStory() {
  const labels = useMvpPatternLabels().formField;

  return (
    <div className="p-8">
      <PatternSection index={4} name="FormField" storyPath="Patterns/FormField">
        <div className="grid max-w-md gap-3">
          <div className="grid gap-2">
            <Label htmlFor="p-user">{labels.userIdLabelShort}</Label>
            <Input id="p-user" defaultValue="bob" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-title">{labels.titleLabelShort}</Label>
            <Textarea id="p-title" rows={2} />
          </div>
          <Button className="w-full">{labels.submitButton}</Button>
        </div>
      </PatternSection>
    </div>
  );
}

function PageHeaderPatternStory() {
  const labels = useMvpPatternLabels().pageHeader;

  return (
    <div className="p-8">
      <PatternSection index={5} name="PageHeader" storyPath="Patterns/PageHeader">
        <header>
          <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
            {labels.feedEyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{labels.feedTitle}</h1>
          <p className="text-muted-foreground">{labels.catalogDescription}</p>
        </header>
      </PatternSection>
    </div>
  );
}

function LoadingFeedPatternStory() {
  return (
    <div className="p-8">
      <PatternSection index={6} name="LoadingFeed" storyPath="Patterns/LoadingFeed">
        <div className="space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </PatternSection>
    </div>
  );
}

export const ListingPatterns: Story = {
  name: "00 · Listing patterns",
  render: () => <ListingPatternsStory />,
};

export const EmptyStatePattern: Story = {
  name: "01 · EmptyState",
  render: () => <EmptyStatePatternStory />,
};

export const ErrorAlertPattern: Story = {
  name: "02 · ErrorAlert",
  render: () => <ErrorAlertPatternStory />,
};

export const FeedItemCardPattern: Story = {
  name: "03 · FeedItemCard",
  render: () => <FeedItemCardPatternStory />,
};

export const FormFieldPattern: Story = {
  name: "04 · FormField",
  render: () => <FormFieldPatternStory />,
};

export const PageHeaderPattern: Story = {
  name: "05 · PageHeader",
  render: () => <PageHeaderPatternStory />,
};

export const LoadingFeedPattern: Story = {
  name: "06 · LoadingFeed",
  render: () => <LoadingFeedPatternStory />,
};
