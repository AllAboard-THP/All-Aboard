import type { Meta, StoryObj } from "@storybook/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Separator } from "./separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-80 space-y-4 bg-background p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Section A</p>
        <p className="text-sm text-muted-foreground">Contenu au-dessus.</p>
      </div>
      <Separator />
      <div>
        <p className="text-sm font-medium text-foreground">Section B</p>
        <p className="text-sm text-muted-foreground">Contenu en-dessous.</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <Card className="w-80 bg-background">
      <CardHeader>
        <CardTitle>Feed communautaire</CardTitle>
        <CardDescription>En-tête de page.</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent>
        <p className="m-0 text-sm text-muted-foreground">Liste des demandes.</p>
      </CardContent>
    </Card>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4 bg-background p-4">
      <span className="text-sm text-foreground">Feed</span>
      <Separator orientation="vertical" className="h-6" />
      <span className="text-sm text-muted-foreground">Mentor</span>
    </div>
  ),
};
