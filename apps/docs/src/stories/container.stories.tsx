import type { Meta, StoryObj } from "@storybook/react-vite";
import { Container, Text } from "@puranderdua/ui";

const meta = {
  title: "Layout/Container",
  component: Container,
  args: { size: "md" },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl", "full"],
    },
  },
  render: (args) => (
    <Container {...args} className="border border-dashed border-ds-border">
      <Text>
        Centred, capped at the container token for its size, with the page
        gutter on both sides.
      </Text>
    </Container>
  ),
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-gap-md">
      {(["sm", "md", "lg", "xl", "full"] as const).map((size) => (
        <Container
          key={size}
          size={size}
          className="border border-dashed border-ds-border"
        >
          <Text variant="caption">size="{size}"</Text>
        </Container>
      ))}
    </div>
  ),
};

export const AsMain: Story = {
  render: () => (
    <Container as="main" size="sm">
      <Text>A Container rendered as a main landmark.</Text>
    </Container>
  ),
};
