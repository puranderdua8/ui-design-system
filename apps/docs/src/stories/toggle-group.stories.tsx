import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "@puranderdua/ui";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          '**Usage.** A row of toggle buttons: `type="single"` keeps one pressed, `type="multiple"` lets several be pressed. Name the group with `aria-label`.\n\n**Accessibility.** Arrow keys move between items, Space or Enter presses one. A pressed item has a filled surface and a heavier border, so it does not rely on colour alone.',
      },
    },
  },
  args: { "aria-label": "Alignment" },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { type: "single", defaultValue: "left" },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Centre</ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    "aria-label": "Text style",
    defaultValue: ["bold"],
  },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const WithDisabledItem: Story = {
  args: { type: "single", defaultValue: "a", "aria-label": "Size" },
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem value="a">Small</ToggleGroupItem>
      <ToggleGroupItem value="b">Medium</ToggleGroupItem>
      <ToggleGroupItem value="c" disabled>
        Large
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
