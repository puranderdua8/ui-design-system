import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "@puranderdua/ui";

const meta = {
  title: "Components/Text",
  component: Text,
  args: { children: "The quick brown fox jumps over the lazy dog." },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Body: Story = { args: { variant: "body" } };
export const Lead: Story = { args: { variant: "lead" } };
export const Caption: Story = { args: { variant: "caption" } };
export const Label: Story = { args: { variant: "label", as: "span" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Text variant="lead">Lead: introductory paragraph.</Text>
      <Text variant="body">Body: default running text.</Text>
      <Text variant="caption">Caption: muted supporting text.</Text>
      <Text variant="label" as="span">
        Label: form and control text.
      </Text>
    </div>
  ),
};

/** `as` changes the HTML element; `variant` changes only the look. */
export const ElementIndependentOfVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Text as="span" variant="lead">
        A span styled as lead
      </Text>
      <Text as="div" variant="caption">
        A div styled as caption
      </Text>
      <Text as="p" variant="label">
        A p styled as label
      </Text>
    </div>
  ),
};
