import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta = { title: "Kit/§8.2 Tabs" };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="a" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="a">Onglet A</TabsTrigger>
        <TabsTrigger value="b">Onglet B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Contenu A</TabsContent>
      <TabsContent value="b">Contenu B</TabsContent>
    </Tabs>
  ),
};
