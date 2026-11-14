import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Section,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@puranderdua/ui";

const Panels = () => (
  <>
    <TabsList aria-label="Plans">
      <TabsTrigger value="free">Free</TabsTrigger>
      <TabsTrigger value="team">Team</TabsTrigger>
      <TabsTrigger value="enterprise" disabled>
        Enterprise
      </TabsTrigger>
      <TabsTrigger value="custom">Custom</TabsTrigger>
    </TabsList>
    <TabsContent value="free">
      <Text>Free: one project, community support.</Text>
    </TabsContent>
    <TabsContent value="team">
      <Text>Team: shared projects and comments.</Text>
    </TabsContent>
    <TabsContent value="enterprise">
      <Text>Enterprise: contact us.</Text>
    </TabsContent>
    <TabsContent value="custom">
      <Text>Custom: tell us what you need.</Text>
    </TabsContent>
  </>
);

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Adapted from shadcn new-york-v4 on `radix-ui`. Arrow keys move between tabs (Home and End jump), a disabled tab is skipped. `activationMode` is passed to Radix: `automatic` (default) selects on focus, `manual` selects on Enter or Space. The look follows the surrounding tone, so it needs no prop on dark Sections.",
      },
    },
  },
  args: { defaultValue: "free" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
};

export const ManualActivation: Story = {
  args: { activationMode: "manual" },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Tabs {...args}>
      <Panels />
    </Tabs>
  ),
};

/** Labels, the active label and marker (`text.accent`, `accent.border`) and the focus ring are role colours the tone re-maps. */
export const InTones: Story = {
  render: () => (
    <>
      {(["canvas", "subtle", "inverse", "brand"] as const).map((tone) => (
        <Section
          key={tone}
          tone={tone}
          container="md"
          padding="sm"
          aria-label={`${tone} section`}
        >
          <Tabs defaultValue="free">
            <TabsList aria-label={`Plans on ${tone}`}>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
            <TabsContent value="free">
              <Text>Free plan on {tone}.</Text>
            </TabsContent>
            <TabsContent value="team">
              <Text>Team plan on {tone}.</Text>
            </TabsContent>
          </Tabs>
        </Section>
      ))}
    </>
  ),
};
