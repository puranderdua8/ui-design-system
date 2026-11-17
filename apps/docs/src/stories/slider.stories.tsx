import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field, Slider } from "@puranderdua/ui";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** A fine-tune control for a number in a range. Name it with `aria-label` or put it in a `Field`. The current value is shown as text (`showValue`, `formatValue`); `aria-valuetext` gives a screen reader the value in words.\n\n**Accessibility.** Arrow keys move one step, Page Up and Page Down move ten, Home and End jump to the ends. Each thumb keeps a pointer target of at least 24px.",
      },
    },
  },
  args: { "aria-label": "Corner size", defaultValue: [8], max: 16 },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWords: Story = {
  args: {
    "aria-label": "Roundness",
    defaultValue: [1],
    max: 2,
    "aria-valuetext": (v: number) => ["Square", "Soft", "Round"][v]!,
    formatValue: (v: number) => ["Square", "Soft", "Round"][v]!,
  },
};

export const Range: Story = {
  args: {
    "aria-label": "Width",
    defaultValue: [20, 70],
    thumbLabels: ["Minimum", "Maximum"],
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <Field label="Corner size" description="In pixels.">
      <Slider {...args} formatValue={(v) => `${v} px`} />
    </Field>
  ),
};
