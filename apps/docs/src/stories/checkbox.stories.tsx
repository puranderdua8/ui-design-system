import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Cluster, Field, Label, Stack } from "@puranderdua/ui";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  args: { "aria-label": "Example" },
  argTypes: { disabled: { control: "boolean" } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { checked: "indeterminate" } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };

/** Checkbox with a Label beside it. */
export const WithLabel: Story = {
  render: () => (
    <Cluster gap="xs" align="center">
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Subscribe to the newsletter</Label>
    </Cluster>
  ),
};

/** Description, error and required wiring through Field. */
export const InField: Story = {
  render: () => (
    <Field
      label="Terms"
      description="You need to accept to continue."
      error="Accept the terms to continue."
      required
    >
      <Checkbox />
    </Field>
  ),
};

/** State matrix. */
export const Matrix: Story = {
  render: () => (
    <Stack gap="sm">
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" checked="indeterminate" />
      <Checkbox aria-label="Invalid" aria-invalid />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Disabled checked" disabled defaultChecked />
    </Stack>
  ),
};
