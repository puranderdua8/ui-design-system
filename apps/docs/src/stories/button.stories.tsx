import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@puranderdua/ui";

const meta = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Small: Story = { args: { size: "sm" } };
export const Disabled: Story = { args: { disabled: true } };

export const AsLink: Story = {
  render: () => (
    <Button asChild variant="secondary">
      <a href="#example">Link styled as a button</a>
    </Button>
  ),
};

const variants = ["primary", "secondary"] as const;
const sizes = ["sm", "md"] as const;

/** Every variant × size × state. Use Tab to see the focus ring. */
export const Matrix: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-4">
      <span />
      <span className="font-medium">Default</span>
      <span className="font-medium">Disabled</span>
      {variants.flatMap((variant) =>
        sizes.map((size) => (
          <div key={`${variant}-${size}`} className="contents">
            <span>
              {variant} / {size}
            </span>
            <div>
              <Button variant={variant} size={size}>
                Button
              </Button>
            </div>
            <div>
              <Button variant={variant} size={size} disabled>
                Button
              </Button>
            </div>
          </div>
        )),
      )}
    </div>
  ),
};
