import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Field,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  parameters: {
    docs: {
      description: {
        component:
          "**Usage.** Applies a theme to a subtree: `theme` is a name (written to `data-ds-theme`), `vars` is the `vars` map from `themes/<name>.json` (applied as inline custom properties), and `dir` is `ltr` or `rtl`. It also sets `color-scheme: light`. Portals rendered through `ScopedPortal` (Select's list) re-apply the nearest scope, so they keep its theme and direction.\n\n**Accessibility.** `dir` sets the reading direction for the subtree and for Radix keyboard handling inside it. Pass the whole map from the JSON file; do not hand-write theme values.",
      },
    },
  },
  args: { theme: "warm", vars: warmVars },
} satisfies Meta<typeof ThemeScope>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `ThemeScope` applies a theme's resolved vars to its own element. Overlays
 * portal to `document.body` (so no ancestor can clip them) and `ScopedPortal`
 * re-applies the scope there: the list carries the scope's theme and vars.
 */
export const PortalKeepsScope: Story = {
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
    await expect(scope?.contains(list)).toBe(false);
    await expect(list.getAttribute("data-ds-theme")).toBe("warm");
    await expect(getComputedStyle(list).backgroundColor).toBe(
      "rgb(255, 244, 229)",
    );
    // Radix hides the rest of the page while the list is open; close it so the
    // a11y check runs on the settled page.
    await userEvent.keyboard("{Escape}");
    await expect(within(document.body).queryByRole("listbox")).toBeNull();
  },
};

/**
 * `dir="rtl"` sets the attribute and tells Radix components which way to read,
 * so the tab row runs right to left and ArrowLeft moves to the next tab. On a
 * page that is already RTL without a `ThemeScope`, wrap the app in
 * `DirectionProvider` and set `dir` on `<html>`.
 */
export const RtlTabs: Story = {
  render: (args) => (
    <ThemeScope {...args} dir="rtl" className="p-ds-gap-lg">
      <Tabs defaultValue="one">
        <TabsList aria-label="Sections">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
        <TabsContent value="three">Third panel</TabsContent>
      </Tabs>
    </ThemeScope>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("tab", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(canvas.getByRole("tab", { name: "Two" })).toHaveFocus(),
    );
  },
};
