import type { Meta, StoryObj } from "@storybook/react";

import { CodeBlock } from "@/components/code-block";

const meta: Meta = { title: "Kit/§8.9 Code block" };
export default meta;
type Story = StoryObj;

export const Javascript: Story = {
  render: () => (
    <CodeBlock
      code={`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
    />
  ),
};
