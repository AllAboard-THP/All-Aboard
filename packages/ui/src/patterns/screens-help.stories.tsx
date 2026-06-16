import type { Meta, StoryObj } from "@storybook/react";

import {
  HelpNewScreen,
  HelpRequestDetailScreen,
} from "./screens/legacy-screens";
import { screenStoryParameters } from "./pattern-story-frame";

const meta = {
  title: "Screens/Help",
  parameters: screenStoryParameters,
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewRequest: Story = {
  name: "NewRequest",
  render: () => <HelpNewScreen />,
};

export const RequestDetail: Story = {
  name: "RequestDetail",
  render: () => <HelpRequestDetailScreen />,
};
