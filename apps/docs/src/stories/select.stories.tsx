import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@puranderdua/ui";

const Options = () => (
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruit</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="cherry" disabled>
        Cherry (sold out)
      </SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="leek">Leek</SelectItem>
    </SelectGroup>
  </SelectContent>
);

const meta = {
  title: "Components/Select",
  component: SelectTrigger,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** Compose `Select`, `SelectTrigger` (`size` sm | md), `SelectValue`, `SelectContent` and `SelectItem` (`value` required); `SelectGroup`, `SelectLabel` and `SelectSeparator` group items. The list renders in `document.body` through `ScopedPortal`, which re-applies the nearest `ThemeScope`'s theme and direction, so an open list keeps the theme and is not clipped by an ancestor with `overflow`. A `container` prop on `SelectContent` wins over that.\n\n**Accessibility.** The trigger needs a name: a `Field` label or an `aria-label`. Arrow keys, Home, End and type-ahead work as in a native list. For right-to-left pages set `dir` (see `RadioGroup`).",
      },
    },
  },
  args: { "aria-label": "Produce", size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof SelectTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-64">
      <Select>
        <SelectTrigger {...args}>
          <SelectValue placeholder="Pick produce" />
        </SelectTrigger>
        <Options />
      </Select>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      {(["sm", "md"] as const).map((size) => (
        <Select key={size}>
          <SelectTrigger {...args} size={size} aria-label={`Produce ${size}`}>
            <SelectValue placeholder={`Size ${size}`} />
          </SelectTrigger>
          <Options />
        </Select>
      ))}
    </div>
  ),
};

export const WithValue: Story = {
  render: (args) => (
    <div className="w-64">
      <Select defaultValue="banana">
        <SelectTrigger {...args}>
          <SelectValue />
        </SelectTrigger>
        <Options />
      </Select>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="w-64">
      <Select disabled>
        <SelectTrigger {...args}>
          <SelectValue placeholder="Unavailable" />
        </SelectTrigger>
        <Options />
      </Select>
    </div>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true },
  render: (args) => (
    <div className="w-64">
      <Select>
        <SelectTrigger {...args}>
          <SelectValue placeholder="Pick produce" />
        </SelectTrigger>
        <Options />
      </Select>
    </div>
  ),
};

/** The Field label names the trigger; description and error are linked. */
export const InField: Story = {
  args: { "aria-label": undefined },
  render: (args) => (
    <div className="w-64">
      <Field
        label="Produce"
        description="What goes in the box."
        error="Pick something."
        required
      >
        <Select>
          <SelectTrigger {...args}>
            <SelectValue placeholder="Pick produce" />
          </SelectTrigger>
          <Options />
        </Select>
      </Field>
    </div>
  ),
};
