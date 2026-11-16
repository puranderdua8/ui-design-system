import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Stack } from "@puranderdua/ui";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** `size` sm | md, plus every native `<input>` prop except the native `size`. Inside a `Field` it takes its `id`, `required`, `aria-invalid` and `aria-describedby` from it; a prop you set yourself wins.\n\n**Accessibility.** An input needs a name: put it in a `Field` with a `label`, or give it an `aria-label`. With a `Field` `error` it is also marked `aria-invalid` and linked to the message.",
      },
    },
  },
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
