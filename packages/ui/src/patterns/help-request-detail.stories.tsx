import type { Meta, StoryObj } from "@storybook/react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/alert";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Skeleton } from "../components/skeleton";
import { useAlertLabels, useMvpPatternLabels } from "../i18n/storybook-locale";
import { CommentCard } from "./legacy-feed-patterns";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/HelpRequestDetail",
  parameters: patternStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function LoadedStory() {
  const pageLabels = useMvpPatternLabels().pageHeader;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {pageLabels.detailEyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{pageLabels.detailTitle}</h1>
        <p className="text-muted-foreground">{pageLabels.detailMeta}</p>
      </header>
      <div className="space-y-4">
        <CommentCard
          authorName="Yann L."
          authorInitials="YL"
          timeAgo="il y a 1 h"
          body="Essaie de retirer data des deps ou de mémoriser fetchData avec useCallback."
          code={{
            language: "javascript",
            snippet: "const fetchData = useCallback(() => {...}, []);",
          }}
        />
        <CommentCard
          authorName="Inès M."
          authorInitials="IM"
          timeAgo="il y a 45 min"
          body="Tu peux aussi isoler la logique dans un hook dédié pour clarifier le composant."
        />
      </div>
    </div>
  );
}

function LoadingStory() {
  const labels = useMvpPatternLabels().loadingFeed;

  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-6 p-6"
      aria-busy="true"
      aria-label={labels.requestAriaLabel}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-28 w-full rounded-lg" />
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  );
}

function ErrorStory() {
  const alertLabels = useAlertLabels();
  const emptyLabels = useMvpPatternLabels().emptyState;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Alert variant="destructive">
        <AlertTitle>{alertLabels.feedLoadError}</AlertTitle>
        <AlertDescription>{alertLabels.http502}</AlertDescription>
      </Alert>
      <Button type="button" variant="outline">
        {emptyLabels.backToFeed}
      </Button>
    </div>
  );
}

function NotFoundStory() {
  const emptyLabels = useMvpPatternLabels().emptyState;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{emptyLabels.notFoundTitle}</CardTitle>
          <CardDescription>
            {emptyLabels.notFoundDescriptionBefore}
            <code className="text-foreground">{emptyLabels.notFoundId}</code>
            {emptyLabels.notFoundDescriptionAfter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline">
            {emptyLabels.backToFeed}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export const Loaded: Story = {
  name: "Loaded",
  decorators: [withPatternStoryFrame("full")],
  render: () => <LoadedStory />,
};

export const Loading: Story = {
  name: "Loading",
  decorators: [withPatternStoryFrame("full")],
  render: () => <LoadingStory />,
};

export const Error: Story = {
  name: "Error",
  decorators: [withPatternStoryFrame("full")],
  render: () => <ErrorStory />,
};

export const NotFound: Story = {
  name: "NotFound",
  decorators: [withPatternStoryFrame("full")],
  render: () => <NotFoundStory />,
};
