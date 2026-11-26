import type { Meta, StoryObj } from "@storybook/react";

import { useMvpPatternLabels } from "../i18n/storybook-locale";
import { Skeleton } from "../components/skeleton";

const meta = {
  title: "Patterns/LoadingFeed",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function FeedListStory() {
  const labels = useMvpPatternLabels().loadingFeed;

  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-6 p-6"
      aria-busy="true"
      aria-label={labels.feedAriaLabel}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full max-w-prose" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    </div>
  );
}

function RequestDetailStory() {
  const labels = useMvpPatternLabels().loadingFeed;

  return (
    <div
      className="mx-auto w-full max-w-3xl space-y-6 p-6"
      aria-busy="true"
      aria-label={labels.requestAriaLabel}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

export const FeedList: Story = {
  render: () => <FeedListStory />,
};

export const RequestDetail: Story = {
  render: () => <RequestDetailStory />,
};
