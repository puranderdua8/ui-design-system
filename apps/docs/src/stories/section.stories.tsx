import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Cluster,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@puranderdua/ui";

const Body = ({ label }: { label: string }) => (
  <Stack gap="sm">
    <Heading as="h3" variant="h3">
      {label}
    </Heading>
    <Text>
      Text colour follows the tone, so it stays readable on each band.
    </Text>
  </Stack>
);

const meta = {
  title: "Layout/Section",
  component: Section,
  args: { tone: "canvas", padding: "md", container: "md" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["canvas", "subtle", "inverse", "brand"],
    },
    padding: { control: "inline-radio", options: ["sm", "md", "lg"] },
    container: {
      control: "inline-radio",
      options: [undefined, "sm", "md", "lg", "xl", "full"],
    },
  },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <Section {...args}>
      <Body label="Section" />
    </Section>
  ),
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <>
      {(["canvas", "subtle", "inverse", "brand"] as const).map((tone) => (
        <Section key={tone} tone={tone} container="md" padding="sm">
          <Body label={`tone="${tone}"`} />
        </Section>
      ))}
    </>
  ),
};

/**
 * Links and buttons keep their contrast on every tone: the tone re-maps the
 * role vars (`.ds-tone-*`), so Link and Button need no tone prop.
 */
export const TonesWithActions: Story = {
  render: () => (
    <>
      {(["canvas", "subtle", "inverse", "brand"] as const).map((tone) => (
        <Section key={tone} tone={tone} container="md" padding="sm">
          <Stack gap="sm">
            <Text>
              tone="{tone}": read <Link href="#docs">the documentation</Link> or
              start now.
            </Text>
            <Cluster gap="sm">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Link href="#all" variant="standalone">
                All components
              </Link>
            </Cluster>
          </Stack>
        </Section>
      ))}
    </>
  ),
};

export const Paddings: Story = {
  render: () => (
    <>
      {(["sm", "md", "lg"] as const).map((padding, i) => (
        <Section
          key={padding}
          tone={i % 2 ? "canvas" : "subtle"}
          padding={padding}
          container="md"
        >
          <Text>padding="{padding}"</Text>
        </Section>
      ))}
    </>
  ),
};

export const Narrow320: Story = {
  ...Tones,
  globals: { viewport: { value: "narrow" } },
};

export const Desktop: Story = {
  ...Tones,
  globals: { viewport: { value: "desktop" } },
};
