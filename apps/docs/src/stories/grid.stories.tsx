import type { Meta, StoryObj } from "@storybook/react-vite";
import { Grid, Text } from "@puranderdua/ui";

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-ds-card bg-ds-surface-subtle p-ds-gap-md">
    <Text variant="caption">{children}</Text>
  </div>
);

const cells = (n: number) =>
  Array.from({ length: n }, (_, i) => <Cell key={i}>Item {i + 1}</Cell>);

const meta = {
  title: "Layout/Grid",
  component: Grid,
  args: { cols: 3, gap: "md" },
  argTypes: {
    cols: { control: "inline-radio", options: [1, 2, 3, 4, 6, 12] },
    minItemWidth: {
      control: "inline-radio",
      options: [undefined, "sm", "md", "lg"],
    },
    gap: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
  },
  render: (args) => <Grid {...args}>{cells(6)}</Grid>,
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Columns: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-gap-lg">
      {([1, 2, 3, 4, 6, 12] as const).map((cols) => (
        <div key={cols}>
          <Text variant="label">cols={cols}</Text>
          <Grid cols={cols}>{cells(cols === 1 ? 2 : cols)}</Grid>
        </div>
      ))}
    </div>
  ),
};

/** Auto-fit: as many columns as fit, each at least the token width. */
export const AutoFit: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-gap-lg">
      {(["sm", "md", "lg"] as const).map((w) => (
        <div key={w}>
          <Text variant="label">minItemWidth="{w}"</Text>
          <Grid minItemWidth={w}>{cells(7)}</Grid>
        </div>
      ))}
    </div>
  ),
};

export const AsList: Story = {
  render: () => (
    <Grid as="ul" cols={3}>
      {["One", "Two", "Three"].map((t) => (
        <li key={t}>
          <Cell>{t}</Cell>
        </li>
      ))}
    </Grid>
  ),
};
