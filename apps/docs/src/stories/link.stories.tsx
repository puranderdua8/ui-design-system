import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link, Text } from "@puranderdua/ui";

const meta = {
  title: "Components/Link",
  component: Link,
  args: { children: "Link", href: "#example" },
  argTypes: {
    variant: { control: "inline-radio", options: ["inline", "standalone"] },
    external: { control: "boolean" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = { args: { variant: "inline" } };
export const Standalone: Story = { args: { variant: "standalone" } };
export const External: Story = {
  args: { href: "https://example.com", external: true, children: "Example" },
};

/** Inline links stay underlined, so they never rely on colour alone. */
export const InText: Story = {
  render: () => (
    <Text as="p">
      Read the <Link href="#docs">documentation</Link> or the{" "}
      <Link href="https://example.com" external>
        specification
      </Link>{" "}
      before you start.
    </Text>
  ),
};

/** Use `asChild` to render a framework link (for example `next/link`). */
export const AsChild: Story = {
  render: () => (
    <Link asChild variant="standalone">
      <a href="#example">Styled child anchor</a>
    </Link>
  ),
};
