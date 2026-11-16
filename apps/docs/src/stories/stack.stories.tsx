import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack, Text } from "@puranderdua/ui";

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-ds-card bg-ds-surface-subtle p-ds-gap-sm">
    <Text variant="caption">{children}</Text>
  </div>
);

const meta = {
  title: "Layout/Stack",
  component: Stack,
  parameters: {
    docs: {
      description: {
        component:
          '**Usage.** Vertical flow with a `gap` step and cross-axis `align` (start, center, end, stretch). `as` is div, section, ul, ol, nav or article.\n\n**Accessibility.** `ul` and `ol` get `role="list"`. Children appear in the order you write them; do not use CSS to reorder.',
      },
    },
  },
  args: { gap: "md", align: "stretch" },
  argTypes: {
    gap: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    align: {
      control: "inline-radio",
      options: ["start", "center", "end", "stretch"],
    },
  },
  render: (args) => (
    <Stack {...args}>
      <Box>First</Box>
      <Box>A longer second item</Box>
      <Box>Third</Box>
    </Stack>
  ),
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Gaps: Story = {
  render: () => (
    <div className="flex gap-ds-gap-xl">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <Stack key={gap} gap={gap}>
          <Text variant="label">{gap}</Text>
          <Box>A</Box>
          <Box>B</Box>
          <Box>C</Box>
        </Stack>
      ))}
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="flex gap-ds-gap-xl">
      {(["start", "center", "end", "stretch"] as const).map((align) => (
        <Stack
          key={align}
          align={align}
          className="w-48 border border-dashed border-ds-border"
        >
          <Text variant="label">{align}</Text>
          <Box>Short</Box>
          <Box>A much longer item</Box>
        </Stack>
      ))}
    </div>
  ),
};

export const AsList: Story = {
  render: () => (
    <Stack as="ul" gap="sm">
      <li>
        <Box>One</Box>
      </li>
      <li>
        <Box>Two</Box>
      </li>
    </Stack>
  ),
};
