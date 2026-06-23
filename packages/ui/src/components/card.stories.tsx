import type { Meta, StoryObj } from "@storybook/react";

import {
  PatternDemoCardShell,
  PatternStoryFrame,
} from "../patterns/pattern-story-frame";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Short description for the card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Card body content.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Action
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const FeedEmpty: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <PatternStoryFrame>
      <PatternDemoCardShell>
        <p className="m-0 text-lg font-semibold">Aucune demande pour l&apos;instant</p>
        <p className="m-0 text-sm text-muted-foreground">
          Soyez le premier à publier une demande d&apos;aide.
        </p>
        <Button variant="outline">Publier une demande</Button>
      </PatternDemoCardShell>
    </PatternStoryFrame>
  ),
};

export const LoginForm: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" type="password" placeholder="••••••••" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  ),
};
