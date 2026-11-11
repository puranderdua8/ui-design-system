import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Checkbox,
  Field,
  Fieldset,
  RadioGroup,
  RadioGroupItem,
  Stack,
  Label,
  Cluster,
} from "@puranderdua/ui";

const Plans = () => (
  <RadioGroup defaultValue="free">
    {[
      ["free", "Free"],
      ["team", "Team"],
    ].map(([value, text]) => (
      <Cluster key={value} gap="xs" align="center">
        <RadioGroupItem value={value!} id={`fs-${value}`} />
        <Label htmlFor={`fs-${value}`}>{text}</Label>
      </Cluster>
    ))}
  </RadioGroup>
);

const meta = {
  title: "Components/Fieldset",
  component: Fieldset,
  args: { legend: "Plan", children: <Plans /> },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = {
  args: { description: "You can change this later." },
};
export const WithError: Story = {
  args: {
    description: "You can change this later.",
    error: "Choose a plan.",
    required: true,
    children: (
      <RadioGroup>
        {[
          ["free", "Free"],
          ["team", "Team"],
        ].map(([value, text]) => (
          <Cluster key={value} gap="xs" align="center">
            <RadioGroupItem value={value!} id={`fse-${value}`} />
            <Label htmlFor={`fse-${value}`}>{text}</Label>
          </Cluster>
        ))}
      </RadioGroup>
    ),
  },
};

/** A list of checkboxes: one Fieldset, one inline Field per checkbox. */
export const CheckboxList: Story = {
  args: {
    legend: "Notify me about",
    children: (
      <Stack gap="xs">
        {["Releases", "Security advisories"].map((text) => (
          <Field key={text} layout="inline" label={text}>
            <Checkbox />
          </Field>
        ))}
      </Stack>
    ),
  },
};
