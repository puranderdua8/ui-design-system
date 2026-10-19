import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Text } from "@puranderdua/ui";

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-ds-pill bg-ds-surface-subtle px-ds-gap-sm py-ds-gap-xs text-ds-caption">
    {children}
  </span>
);

const tags = [
  "Tokens",
  "Themes",
  "Typography",
  "Layout",
  "Accessibility",
  "Storybook",
  "React 19",
  "Tailwind v4",
];

const meta = {
  title: "Layout/Cluster",
  component: Cluster,
  args: { gap: "sm", justify: "start", align: "center" },
  argTypes: {
    gap: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    justify: {
      control: "inline-radio",
      options: ["start", "center", "end", "between"],
    },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "baseline", "stretch"],
    },
  },
  render: (args) => (
    <Cluster
      {...args}
      className="max-w-ds-sm border border-dashed border-ds-border"
    >
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </Cluster>
  ),
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Justify: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-gap-md">
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <div key={justify}>
          <Text variant="label">justify="{justify}"</Text>
          <Cluster
            justify={justify}
            className="border border-dashed border-ds-border"
          >
            <Tag>One</Tag>
            <Tag>Two</Tag>
            <Tag>Three</Tag>
          </Cluster>
        </div>
      ))}
    </div>
  ),
};

export const AsNav: Story = {
  render: () => (
    <Cluster as="nav" aria-label="Example">
      <a href="#a">Link A</a>
      <a href="#b">Link B</a>
    </Cluster>
  ),
};
