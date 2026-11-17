import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fieldset, RadioCard, RadioGroup } from "@puranderdua/ui";

const Swatch = ({ className }: { className: string }) => (
  <span className={`block h-16 w-full ${className}`} />
);

const meta = {
  title: "Components/RadioCard",
  component: RadioCard,
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** A picture choice: a radio whose whole card is the target, with an optional `media`, a `label` and a `description`. Use it inside `RadioGroup`, inside a `Fieldset` that names the group.\n\n**Accessibility.** The label names the radio and the description describes it; `media` is hidden from assistive technology. The selected card has a heavier border and a check mark, so it is not shown by colour alone. Arrow keys move between cards.",
      },
    },
  },
  args: { value: "a", label: "Option" },
} satisfies Meta<typeof RadioCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const Cards = () => (
  <>
    <RadioCard
      value="calm"
      label="Calm"
      description="Quiet colours, lots of space"
      media={<Swatch className="bg-ds-surface-subtle" />}
    />
    <RadioCard
      value="bold"
      label="Bold"
      description="Strong colour, big type"
      media={<Swatch className="bg-ds-surface-brand" />}
    />
    <RadioCard value="plain" label="Plain" disabled />
  </>
);

export const Default: Story = {
  render: () => (
    <Fieldset legend="Style" description="You can change this later.">
      <RadioGroup defaultValue="calm" className="grid-cols-3">
        <Cards />
      </RadioGroup>
    </Fieldset>
  ),
};

export const NothingSelected: Story = {
  render: () => (
    <Fieldset legend="Style">
      <RadioGroup className="grid-cols-3">
        <Cards />
      </RadioGroup>
    </Fieldset>
  ),
};

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Style" error="Choose a style." required>
      <RadioGroup className="grid-cols-3">
        <Cards />
      </RadioGroup>
    </Fieldset>
  ),
};
