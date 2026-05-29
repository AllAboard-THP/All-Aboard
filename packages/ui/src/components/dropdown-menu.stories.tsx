import type { Meta, StoryObj } from "@storybook/react";
import { Settings, User } from "lucide-react";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "../patterns/pattern-story-frame";

const meta = {
  title: "Components/DropdownMenu",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ouvrir le menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="glass w-48">
        <DropdownMenuItem>
          <User data-icon="inline-start" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings data-icon="inline-start" />
          Paramètres
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
