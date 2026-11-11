import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Text,
  ThemeScope,
} from "@puranderdua/ui";
import base from "@puranderdua/ui/themes/base.json";

// A scope that visibly differs from the page: warm raised surface and border.
const warmVars = {
  ...base.vars,
  "--ds-surface-raised": "#fff4e5",
  "--ds-border": "#b45309",
};

const meta = {
  title: "Foundations/ThemeScope",
  component: ThemeScope,
  args: { theme: "warm", vars: warmVars },
} satisfies Meta<typeof ThemeScope>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `ThemeScope` applies a theme's resolved vars to its own element and is the
 * default portal container. Opening the Select renders the list inside the
 * scope (it carries the scope's vars), not on `document.body`.
 */
export const PortalInsideScope: Story = {
  render: (args) => (
    <ThemeScope {...args} data-testid="scope" className="p-ds-gap-lg">
      <Stack gap="md">
        <Text variant="label">Inside the scope</Text>
        <Field label="Fruit">
          <Select>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Stack>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox", { name: "Fruit" }));
    const list = await within(document.body).findByRole("listbox");
    const scope = canvasElement.querySelector('[data-slot="theme-scope"]');
    await expect(scope?.contains(list)).toBe(true);
    // Radix hides the rest of the page while the list is open; close it so the
    // a11y check runs on the settled page.
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
  },
};
