import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame("form")],
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProfileTabs: Story = {
  render: () => (
    <Tabs defaultValue="posts" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="posts">Requêtes</TabsTrigger>
        <TabsTrigger value="comments">Réponses</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-4 text-sm text-muted-foreground">
        Liste mock des requêtes publiées.
      </TabsContent>
      <TabsContent value="comments" className="mt-4 text-sm text-muted-foreground">
        Liste mock des réponses données.
      </TabsContent>
    </Tabs>
  ),
};
