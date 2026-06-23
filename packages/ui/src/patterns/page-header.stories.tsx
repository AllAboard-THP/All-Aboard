import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import { useMvpPatternLabels } from "../i18n/storybook-locale";
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

function FeedHeroStory() {
  const labels = useMvpPatternLabels().pageHeader;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {labels.feedEyebrow}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground md:text-4xl">
          {labels.feedTitle}
        </h1>
        <p className="m-0 max-w-prose text-base text-muted-foreground">
          {labels.feedDescription}
        </p>
        <div className="mt-4">
          <Button>{labels.feedCta}</Button>
        </div>
      </header>
      <Separator />
    </div>
  );
}

function MentorHeroStory() {
  const labels = useMvpPatternLabels().pageHeader;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {labels.mentorEyebrow}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {labels.mentorTitle}
        </h1>
        <p className="m-0 text-muted-foreground">{labels.mentorDescription}</p>
      </header>
      <Separator />
    </div>
  );
}

function DetailHeroStory() {
  const labels = useMvpPatternLabels().pageHeader;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <p className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {labels.detailEyebrow}
        </p>
        <h1 className="mt-2 mb-2 text-3xl font-semibold text-foreground">
          {labels.detailTitle}
        </h1>
        <p className="text-base text-muted-foreground">{labels.detailMeta}</p>
      </header>
      <Separator />
    </div>
  );
}

export const FeedHero: Story = {
  render: () => <FeedHeroStory />,
};

export const MentorHero: Story = {
  render: () => <MentorHeroStory />,
};

export const DetailHero: Story = {
  render: () => <DetailHeroStory />,
};
