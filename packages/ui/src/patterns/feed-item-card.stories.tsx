import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";

const meta = {
  title: "Patterns/FeedItemCard",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-3xl transition-colors hover:border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <span className="text-foreground hover:text-primary hover:underline">
            Comment structurer un monorepo Turborepo ?
          </span>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          <span>Auteur : bob</span>
          <span>26 mai 2026, 14:30</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">mentor</Badge>
          <Badge variant="outline">turborepo</Badge>
        </div>
      </CardContent>
    </Card>
  ),
};

export const WithoutTags: Story = {
  render: () => (
    <Card className="w-full max-w-3xl transition-colors hover:border-primary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          <span className="text-foreground hover:text-primary hover:underline">
            Problème de connexion PostgreSQL
          </span>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          <span>Auteur : alice</span>
          <span>25 mai 2026, 09:15</span>
        </CardDescription>
      </CardHeader>
    </Card>
  ),
};
