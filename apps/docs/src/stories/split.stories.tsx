import type { Meta, StoryObj } from "@storybook/react-vite";
import { Split, Stack, Text } from "@puranderdua/ui";

const Pane = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-ds-card bg-ds-surface-subtle p-ds-gap-md">
    <Text variant="caption">{children}</Text>
  </div>
);

const meta = {
  title: "Layout/Split",
  component: Split,
  args: { ratio: "1:1", reverse: false, align: "stretch", gap: "lg" },
  argTypes: {
    ratio: { control: "inline-radio", options: ["1:1", "1:2", "2:1"] },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "stretch"],
    },
    gap: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    reverse: { control: "boolean" },
  },
  render: (args) => (
    <Split {...args}>
      <Pane>First (DOM order)</Pane>
      <Pane>Second (DOM order)</Pane>
    </Split>
  ),
} satisfies Meta<typeof Split>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Ratios: Story = {
  render: () => (
    <Stack gap="lg">
      {(["1:1", "1:2", "2:1"] as const).map((ratio) => (
        <Split key={ratio} ratio={ratio}>
          <Pane>ratio {ratio}: first</Pane>
          <Pane>ratio {ratio}: second</Pane>
        </Split>
      ))}
      <Split reverse ratio="1:2">
        <Pane>reverse: first in DOM, shown second</Pane>
        <Pane>reverse: second in DOM, shown first</Pane>
      </Split>
    </Stack>
  ),
};

export const Aligned: Story = {
  render: () => (
    <Stack gap="lg">
      {(["start", "center", "end"] as const).map((align) => (
        <Split key={align} align={align}>
          <Pane>align {align}</Pane>
          <Pane>
            A taller second column
            <br />
            to show the alignment
            <br />
            of the first.
          </Pane>
        </Split>
      ))}
    </Stack>
  ),
};

/** Under `md` the columns stack in DOM order, reversed or not. */
export const Narrow320: Story = {
  ...Ratios,
  globals: { viewport: { value: "narrow" } },
};

export const Desktop: Story = {
  ...Ratios,
  globals: { viewport: { value: "desktop" } },
};
