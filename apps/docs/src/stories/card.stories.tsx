import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  Cluster,
  Grid,
  Link,
  Section,
  Stack,
  Text,
} from "@puranderdua/ui";

// A small, flat placeholder image: no network, nothing to load.
const media =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120"><rect width="320" height="120" fill="#c4c4c4"/><circle cx="160" cy="60" r="32" fill="#8a8a8a"/></svg>',
  );

const Body = ({ variant }: { variant?: "outline" | "raised" }) => (
  <Card variant={variant ?? "outline"} className="max-w-ds-sm">
    <CardHeader>
      <CardTitle as="h2">Team plan</CardTitle>
      <CardDescription>For small groups.</CardDescription>
    </CardHeader>
    <CardContent>
      <Text>
        Shared projects, comments and a weekly summary.{" "}
        <Link href="#docs">See what is included</Link>.
      </Text>
    </CardContent>
    <CardFooter>
      <Button>Choose plan</Button>
      <Button variant="secondary">Compare</Button>
    </CardFooter>
  </Card>
);

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Card parts: `Card` (`variant` outline | raised), `CardMedia`, `CardHeader`, `CardTitle` (a `Heading`, level set with `as`), `CardDescription`, `CardContent`, `CardFooter`. Server-safe: no client code.",
      },
    },
  },
  args: { variant: "outline" },
  argTypes: {
    variant: { control: "inline-radio", options: ["outline", "raised"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {
  render: () => <Body variant="outline" />,
};

export const Raised: Story = {
  render: () => <Body variant="raised" />,
};

export const WithMedia: Story = {
  render: () => (
    <Card variant="raised" as="article" className="max-w-ds-sm">
      <CardMedia>
        <img src={media} alt="" className="block h-auto w-full" />
      </CardMedia>
      <CardHeader>
        <CardTitle as="h2">Field notes</CardTitle>
        <CardDescription>Updated weekly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Short write-ups from the design system.</Text>
      </CardContent>
      <CardFooter>
        <Link href="#notes">Read the notes</Link>
      </CardFooter>
    </Card>
  ),
};

/**
 * A raised card restores the base text, link and action colours (`.ds-tone-raised`),
 * so it reads inside any Section tone. An outline card has no fill and follows
 * the tone around it. Both are contrast-checked per theme (D-080).
 */
export const InTones: Story = {
  render: () => (
    <Stack gap="md">
      {(["canvas", "subtle", "inverse", "brand"] as const).map((tone) => (
        <Section
          key={tone}
          tone={tone}
          container="lg"
          padding="sm"
          aria-label={`${tone} section`}
        >
          <Cluster gap="md" align="start">
            <Body variant="raised" />
            <Body variant="outline" />
          </Cluster>
        </Section>
      ))}
    </Stack>
  ),
};

/** Cards in a grid follow the width of their container. */
export const InAGrid: Story = {
  render: () => (
    <Grid minItemWidth="md" gap="md" as="ul">
      {["One", "Two", "Three"].map((n) => (
        <Card key={n} as="li" variant="raised">
          <CardHeader>
            <CardTitle as="h2">{n}</CardTitle>
            <CardDescription>Item {n.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Content for {n.toLowerCase()}.</Text>
          </CardContent>
        </Card>
      ))}
    </Grid>
  ),
};
