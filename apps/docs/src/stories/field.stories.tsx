import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Field, Input, Label, Stack } from "@puranderdua/ui";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** Wraps **one** control with a `label`, optional `description` and `error`, and `required`. It wires the control's `id`, `aria-describedby`, `aria-invalid` and `required` for you. `id` is the **control's** id, not the wrapper's. `layout=\"inline\"` puts the control first and the label beside it (a Checkbox). For a group of controls (a radio group, a list of checkboxes) use `Fieldset`; a `RadioGroup` inside a `Field` warns in development.\n\n**Accessibility.** The error is announced (`role=\"alert\"`) and sets the control invalid; there is no invalid state without a message. A summary of errors and moving focus to the first invalid control after a failed submit are the app's job, not the component's.",
      },
    },
  },
  args: { label: "Email", children: <Input placeholder="you@example.com" /> },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "We only use it to send your receipt." },
};
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  args: {
    description: "Use your work address.",
    error: "Enter a valid email address.",
    required: true,
  },
};
export const Disabled: Story = {
  args: { children: <Input disabled placeholder="you@example.com" /> },
};

/** `layout="inline"`: control first, label beside it; description and error below. */
export const InlineCheckbox: Story = {
  args: {
    layout: "inline",
    label: "I accept the terms",
    description: "You can read them in full first.",
    error: "You must accept to continue.",
    required: true,
    children: <Checkbox />,
  },
};

/** Label on its own, for controls that are not wrapped in a Field. */
export const LabelOnly: Story = {
  render: () => (
    <Stack gap="xs">
      <Label htmlFor="standalone">Search</Label>
      <Input id="standalone" />
    </Stack>
  ),
};
