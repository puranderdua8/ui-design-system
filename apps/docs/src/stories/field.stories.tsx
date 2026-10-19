import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Input, Label, Stack } from "@puranderdua/ui";

const meta = {
  title: "Components/Field",
  component: Field,
  args: { label: "Email", children: <Input placeholder="you@example.com" /> },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "We only use it to send your receipt." },
};
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  args: {
    description: "Use your work address.",
    error: "Enter a valid email address.",
    required: true,
  },
};
export const Disabled: Story = {
  args: { children: <Input disabled placeholder="you@example.com" /> },
};

/** Label on its own, for controls that are not wrapped in a Field. */
export const LabelOnly: Story = {
  render: () => (
    <Stack gap="xs">
      <Label htmlFor="standalone">Search</Label>
      <Input id="standalone" />
    </Stack>
  ),
};
