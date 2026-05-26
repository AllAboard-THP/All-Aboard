import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";

const meta = {
  title: "Patterns/EmptyState",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedEmpty: Story = {
  render: () => (
    <Card className="w-full max-w-3xl bg-background">
      <CardHeader>
        <CardTitle className="text-lg">Aucune demande pour l&apos;instant</CardTitle>
        <CardDescription>
          Soyez le premier à publier une demande d&apos;aide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline">Publier une demande</Button>
      </CardContent>
    </Card>
  ),
};

export const ResponsesEmpty: Story = {
  render: () => (
    <Card className="w-full max-w-3xl bg-background">
      <CardHeader>
        <CardTitle className="text-lg">Aucune réponse pour l&apos;instant</CardTitle>
        <CardDescription>
          Les mentors pourront répondre lorsque la demande sera visible.
        </CardDescription>
      </CardHeader>
    </Card>
  ),
};
