import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "@puranderdua/ui";

const meta = {
  title: "Components/Heading",
  component: Heading,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** `variant` is the look (display, h1, h2, h3); `as` is the element (h1 to h6). By default `as` follows `variant`.\n\n**Accessibility.** Set `as` from the page outline, not from the size you want: one `h1` per page, no skipped levels. Use `variant` to change the look. The ref is an `HTMLHeadingElement`.",
      },
    },
  },
  args: { children: "Design systems, in tokens" },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = { args: { variant: "display" } };
export const H1: Story = { args: { variant: "h1" } };
export const H2: Story = { args: { variant: "h2" } };
export const H3: Story = { args: { variant: "h3" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Heading variant="display" as="h2">
        Display
      </Heading>
      <Heading variant="h1" as="h2">
        Heading 1 style
      </Heading>
      <Heading variant="h2" as="h2">
        Heading 2 style
      </Heading>
      <Heading variant="h3" as="h3">
        Heading 3 style
      </Heading>
    </div>
  ),
};

/** The same visual role on different elements, and one element in different roles. */
export const AsVersusVariant: Story = {
  render: () => (
    <section className="flex flex-col gap-4">
      <Heading as="h2" variant="h3">
        An h2 element that looks like an h3
      </Heading>
      <Heading as="h3" variant="h1">
        An h3 element that looks like an h1
      </Heading>
      <Heading as="h4" variant="h3">
        An h4 element that looks like an h3
      </Heading>
    </section>
  ),
};
