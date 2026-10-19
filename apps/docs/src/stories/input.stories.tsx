import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Stack } from "@puranderdua/ui";

const meta = {
  title: "Components/Input",
  component: Input,
  args: { "aria-label": "Example", placeholder: "Type here" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };

/** Size × state matrix. */
export const Matrix: Story = {
  render: () => (
    <Stack gap="sm">
      {(["sm", "md"] as const).map((size) => (
        <Stack key={size} gap="xs">
          <Input
            aria-label={`${size} default`}
            size={size}
            placeholder={`${size} default`}
          />
          <Input
            aria-label={`${size} value`}
            size={size}
            defaultValue="With a value"
          />
          <Input
            aria-label={`${size} invalid`}
            size={size}
            aria-invalid
            defaultValue="Invalid"
          />
          <Input
            aria-label={`${size} disabled`}
            size={size}
            disabled
            placeholder={`${size} disabled`}
          />
        </Stack>
      ))}
    </Stack>
  ),
};
