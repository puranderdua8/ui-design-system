import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, Stack, Text } from "@puranderdua/ui";

const Links = () => (
  <Stack
    gap="xs"
    as="ul"
    className="rounded-ds-card bg-ds-surface-subtle p-ds-gap-md"
  >
    {["Overview", "Components", "Themes"].map((t) => (
      <li key={t}>
        <Text variant="caption">{t}</Text>
      </li>
    ))}
  </Stack>
);

const Content = () => (
  <Stack gap="sm">
    <Text variant="label">Content</Text>
    <Text>
      The content column grows to fill the row and is never narrower than half
      of it. Long unbroken strings such as
      averyveryveryveryveryverylongwordthatwouldotherwiseoverflowthecolumn wrap
      inside it.
    </Text>
  </Stack>
);

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  args: {
    side: "start",
    gap: "lg",
    sidebar: <Links />,
    sidebarAs: "nav",
  },
  argTypes: {
    side: { control: "inline-radio", options: ["start", "end"] },
    gap: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
  },
  render: (args) => (
    <Sidebar {...args}>
      <Content />
    </Sidebar>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sides: Story = {
  render: () => (
    <Stack gap="xl">
      {(["start", "end"] as const).map((side) => (
        <Sidebar key={side} side={side} sidebar={<Links />} sidebarAs="nav">
          <Content />
        </Sidebar>
      ))}
    </Stack>
  ),
};

/** The layout follows the width it is given, so a narrow frame stacks it on any screen. */
export const InNarrowFrame: Story = {
  render: () => (
    <div className="w-80 max-w-full">
      <Sidebar sidebar={<Links />} sidebarAs="nav">
        <Content />
      </Sidebar>
    </div>
  ),
};

/** When the row is too narrow the aside stacks above the content. */
export const Narrow320: Story = {
  ...Sides,
  globals: { viewport: { value: "narrow" } },
};

export const Desktop: Story = {
  ...Sides,
  globals: { viewport: { value: "desktop" } },
};
