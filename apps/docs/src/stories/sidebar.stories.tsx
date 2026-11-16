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
  parameters: {
    docs: {
      description: {
        component:
          '**Usage.** `sidebar` is the aside; the children are the content column. The content wraps below the aside when it would be narrower than half the row. `sidebarSide` is `start` or `end`; `sidebarProps` goes on the aside and `contentProps` on the content column.\n\n**Accessibility.** For `sidebarSide="end"` the content comes first in the DOM and the aside after it, so reading order matches what you see. Name each aside (`sidebarProps={{ "aria-label": ... }}`) when a page has more than one; use `sidebarAs="nav"` for navigation.',
      },
    },
  },
  args: {
    sidebarSide: "start",
    gap: "lg",
    sidebar: <Links />,
    sidebarAs: "nav",
  },
  argTypes: {
    sidebarSide: { control: "inline-radio", options: ["start", "end"] },
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
        <Sidebar
          key={side}
          sidebarSide={side}
          sidebar={<Links />}
          sidebarAs="nav"
          sidebarProps={{ "aria-label": `Links (${side})` }}
        >
          <Content />
        </Sidebar>
      ))}
    </Stack>
  ),
};

/**
 * `sidebarSide="end"` puts the content first in the DOM, so tab and reading order match
 * what you see; stacked, the aside sits below the content. `sidebarProps` names
 * each aside, so two of them are distinct landmarks.
 */
export const NamedAsides: Story = {
  render: () => (
    <Stack gap="xl">
      <Sidebar
        sidebar={<Links />}
        sidebarAs="aside"
        sidebarProps={{ "aria-label": "Filters" }}
      >
        <Content />
      </Sidebar>
      <Sidebar
        sidebarSide="end"
        sidebar={<Links />}
        sidebarAs="aside"
        sidebarProps={{ "aria-label": "Related" }}
      >
        <Content />
      </Sidebar>
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
