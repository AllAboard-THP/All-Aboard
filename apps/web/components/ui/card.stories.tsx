import type { Meta, StoryObj } from "@storybook/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = { title: "Kit/§8.6 Card", component: Card };
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Carte feed</CardTitle>
        <CardDescription>Exemple de carte contenu §8.6</CardDescription>
      </CardHeader>
      <CardContent>Corps de la carte.</CardContent>
    </Card>
  ),
};
