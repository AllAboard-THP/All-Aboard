import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "Components/Sheet",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent side="right" className="glass border-white/10">
        <SheetHeader>
          <SheetTitle>Sheet panel</SheetTitle>
          <SheetDescription>
            Bottom or side drawer primitive for optional mobile panels.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const BottomOpen: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetContent side="bottom" className="glass border-white/10">
        <SheetHeader>
          <SheetTitle>Mobile drawer</SheetTitle>
          <SheetDescription>
            Example bottom sheet aligned with legacy mobile patterns.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
