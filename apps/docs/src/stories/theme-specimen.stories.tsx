import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Cluster,
  Field,
  Grid,
  Heading,
  Input,
  Label,
  Link,
  RadioGroup,
  RadioGroupItem,
  Section,
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
} from "@puranderdua/ui";

const scales: { name: string; steps: string[] }[] = [
  {
    name: "brand",
    steps: [
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ],
  },
  {
    name: "neutral",
    steps: [
      "0",
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
      "950",
    ],
  },
  { name: "red", steps: ["50", "600", "700"] },
];

const Swatches = () => (
  <Stack gap="md">
    {scales.map((scale) => (
      <Stack key={scale.name} gap="sm">
        <Text variant="label">{scale.name}</Text>
        <Cluster gap="sm">
          {scale.steps.map((step) => (
            <div key={step} style={{ width: "4rem" }}>
              <div
                aria-hidden="true"
                style={{
                  height: "3rem",
                  border: "1px solid var(--ds-border-default)",
                  backgroundColor: `var(--ds-color-${scale.name}-${step})`,
                  borderRadius: "var(--ds-radius-sm)",
                }}
              />
              <Text variant="caption">{step}</Text>
            </div>
          ))}
        </Cluster>
      </Stack>
    ))}
  </Stack>
);

const Shapes = () => (
  <Cluster gap="lg" align="center">
    {(
      [
        ["radius sm", "var(--ds-radius-sm)"],
        ["radius md", "var(--ds-radius-md)"],
        ["radius lg", "var(--ds-radius-lg)"],
        ["radius pill", "var(--ds-radius-pill)"],
      ] as const
    ).map(([label, radius]) => (
      <div key={label} style={{ width: "6rem" }}>
        <div
          aria-hidden="true"
          style={{
            height: "4rem",
            borderRadius: radius,
            border:
              "var(--ds-border-width-default) solid var(--ds-border-strong)",
            backgroundColor: "var(--ds-surface-subtle)",
          }}
        />
        <Text variant="caption">{label}</Text>
      </div>
    ))}
    {(
      [
        ["elevation raised", "var(--ds-elevation-raised)"],
        ["elevation overlay", "var(--ds-elevation-overlay)"],
      ] as const
    ).map(([label, shadow]) => (
      <div key={label} style={{ width: "7rem" }}>
        <div
          aria-hidden="true"
          style={{
            height: "4rem",
            boxShadow: shadow,
            borderRadius: "var(--ds-radius-card)",
            backgroundColor: "var(--ds-surface-raised)",
          }}
        />
        <Text variant="caption">{label}</Text>
      </div>
    ))}
  </Cluster>
);

const Motion = () => (
  <Text variant="caption">
    Hover the button to see the theme's motion (
    <code>--ds-motion-duration-normal</code>,{" "}
    <code>--ds-motion-easing-emphasized</code>).
  </Text>
);

const meta = {
  title: "Foundations/Theme specimen",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Every category in one page. Switch the theme in the toolbar: type, colour scales, shape, elevation, density, motion, actions, forms, cards, tabs and the Section tones all follow it.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const specimen = () => (
  <>
    <Section tone="canvas" padding="md" container="lg">
      <Stack gap="lg">
        <Stack gap="sm">
          <Heading as="h1" variant="display">
            Theme specimen
          </Heading>
          <Text variant="lead">
            A quick brown fox jumps over the lazy dog, set in this theme's
            heading and body fonts.
          </Text>
          <Text variant="caption">Caption text, 12 to 14 pixels.</Text>
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Type
          </Heading>
          <Heading as="h3" variant="h3">
            Heading three
          </Heading>
          <Text>
            Body copy with a <Link href="#specimen">link</Link> inside it, to
            check the link colour, underline and weight against the text.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Colour
          </Heading>
          <Swatches />
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Shape and elevation
          </Heading>
          <Shapes />
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Actions and motion
          </Heading>
          <Cluster gap="sm">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button size="sm">Small</Button>
            <Button disabled>Disabled</Button>
          </Cluster>
          <Motion />
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Forms
          </Heading>
          <Grid cols={2} gap="lg">
            <Stack gap="md">
              <Field label="Email" description="We never share it.">
                <Input type="email" placeholder="you@example.com" />
              </Field>
              <Field label="Name" error="Enter your name.">
                <Input defaultValue="" />
              </Field>
              <Field label="Country">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">India</SelectItem>
                    <SelectItem value="nl">Netherlands</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Stack>
            <Stack gap="md">
              <Cluster gap="sm" align="center">
                <Checkbox id="spec-terms" defaultChecked />
                <Label htmlFor="spec-terms">Accept the terms</Label>
              </Cluster>
              <Field label="Contact me by">
                <RadioGroup defaultValue="email">
                  <Cluster gap="sm" align="center">
                    <RadioGroupItem value="email" id="spec-email" />
                    <Label htmlFor="spec-email">Email</Label>
                  </Cluster>
                  <Cluster gap="sm" align="center">
                    <RadioGroupItem value="phone" id="spec-phone" />
                    <Label htmlFor="spec-phone">Phone</Label>
                  </Cluster>
                </RadioGroup>
              </Field>
            </Stack>
          </Grid>
        </Stack>

        <Stack gap="sm">
          <Heading as="h2" variant="h2">
            Cards and tabs
          </Heading>
          <Grid cols={2} gap="lg">
            <Card variant="outline">
              <CardHeader>
                <CardTitle as="h3">Outline card</CardTitle>
                <CardDescription>Flat, bordered.</CardDescription>
              </CardHeader>
              <CardContent>
                <Text>Radius and border width come from the theme.</Text>
              </CardContent>
              <CardFooter>
                <Button size="sm">Open</Button>
              </CardFooter>
            </Card>
            <Card variant="raised">
              <CardHeader>
                <CardTitle as="h3">Raised card</CardTitle>
                <CardDescription>Lifted by elevation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Text>Shadow style is the clearest difference.</Text>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Open
                </Button>
              </CardFooter>
            </Card>
          </Grid>
          <Tabs defaultValue="one">
            <TabsList aria-label="Specimen tabs">
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Text>First panel.</Text>
            </TabsContent>
            <TabsContent value="two">
              <Text>Second panel.</Text>
            </TabsContent>
            <TabsContent value="three">
              <Text>Third panel.</Text>
            </TabsContent>
          </Tabs>
        </Stack>
      </Stack>
    </Section>

    <Section tone="subtle" padding="md" container="lg">
      <Heading as="h2" variant="h3">
        Subtle section
      </Heading>
      <Text>Quiet band, one step off the canvas.</Text>
    </Section>
    <Section tone="inverse" padding="md" container="lg">
      <Stack gap="sm">
        <Heading as="h2" variant="h3">
          Inverse section
        </Heading>
        <Text>
          Dark surface with <Link href="#specimen">a link</Link>.
        </Text>
      </Stack>
    </Section>
    <Section tone="brand" padding="md" container="lg">
      <Stack gap="sm">
        <Heading as="h2" variant="h3">
          Brand section
        </Heading>
        <Text>Filled with the theme's primary colour.</Text>
      </Stack>
    </Section>
  </>
);

/** Follows the theme toolbar. */
export const Specimen: Story = { render: specimen };

// One story per theme with the theme pinned, so the story test run (axe) covers
// every theme without anyone touching the toolbar.
export const Base: Story = { render: specimen, globals: { theme: "base" } };
export const Corporate: Story = {
  render: specimen,
  globals: { theme: "corporate" },
};
export const Nature: Story = { render: specimen, globals: { theme: "nature" } };
export const Quirky: Story = { render: specimen, globals: { theme: "quirky" } };
