import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link, Text } from "@puranderdua/ui";

const meta = {
  title: "Components/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component:
          '**Usage.** `inline` is always underlined (use it inside running text); `standalone` is underlined on hover and focus (navigation, lists of links). `asChild` wraps `next/link`. `external` adds `target="_blank"`, `rel="noopener noreferrer"`, an icon and a hidden hint; translate the hint with `externalLabel` (default "(opens in a new tab)").\n\n**Accessibility.** The underline is the non-colour cue for inline links (WCAG 1.4.1), so do not remove it. Use `standalone` only where the context already shows that the text is a link.',
      },
    },
  },
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

/** `externalLabel` translates the screen-reader hint. */
export const ExternalTranslated: Story = {
  args: {
    href: "https://example.com",
    external: true,
    externalLabel: "(öffnet in neuem Tab)",
    children: "Beispiel",
  },
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
