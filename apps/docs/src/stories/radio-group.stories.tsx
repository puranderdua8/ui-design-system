import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Cluster,
  Field,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@puranderdua/ui";

const Options = ({ disabledLast = false }: { disabledLast?: boolean }) => (
  <>
    {[
      ["free", "Free"],
      ["team", "Team"],
      ["enterprise", "Enterprise"],
    ].map(([value, text], i) => (
      <Cluster key={value} gap="xs" align="center">
        <RadioGroupItem
          value={value!}
          id={`plan-${value}`}
          disabled={disabledLast && i === 2}
        />
        <Label htmlFor={`plan-${value}`}>{text}</Label>
      </Cluster>
    ))}
  </>
);

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  args: { "aria-label": "Plan", defaultValue: "free" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Options />
    </RadioGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Options disabledLast />
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: undefined },
  render: (args) => (
    <RadioGroup {...args}>
      <Options />
    </RadioGroup>
  ),
};

/** The Field label names the group; description and error are linked. */
export const InField: Story = {
  args: { "aria-label": undefined, defaultValue: undefined },
  render: (args) => (
    <Field
      label="Plan"
      description="You can change this later."
      error="Choose a plan."
      required
    >
      <RadioGroup {...args}>
        <Options />
      </RadioGroup>
    </Field>
  ),
};
