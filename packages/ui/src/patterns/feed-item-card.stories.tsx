import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../components/badge";
import {
  PatternDemoCardShell,
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";

const meta = {
  title: "Patterns/FeedItemCard",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PatternDemoCardShell className="transition-colors hover:border-primary/50">
      <p className="m-0 text-lg font-semibold">
        <span className="text-foreground hover:text-primary hover:underline">
          Comment structurer un monorepo Turborepo ?
        </span>
      </p>
      <p className="m-0 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>Auteur : bob</span>
        <span>26 mai 2026, 14:30</span>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Badge variant="secondary">mentor</Badge>
        <Badge variant="outline">turborepo</Badge>
      </div>
    </PatternDemoCardShell>
  ),
};

export const WithoutTags: Story = {
  render: () => (
    <PatternDemoCardShell className="transition-colors hover:border-primary/50">
      <p className="m-0 text-lg font-semibold">
        <span className="text-foreground hover:text-primary hover:underline">
          Problème de connexion PostgreSQL
        </span>
      </p>
      <p className="m-0 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>Auteur : alice</span>
        <span>25 mai 2026, 09:15</span>
      </p>
    </PatternDemoCardShell>
  ),
};

export const HoverFocus: Story = {
  render: () => (
    <PatternDemoCardShell className="border-primary/50 transition-colors hover:border-primary/50">
      <p className="m-0 text-lg font-semibold">
        <a
          href="#feed-item"
          className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Titre avec focus clavier visible
        </a>
      </p>
      <p className="m-0 text-sm text-muted-foreground">
        État hover / focus documenté pour les liens feed.
      </p>
    </PatternDemoCardShell>
  ),
};
