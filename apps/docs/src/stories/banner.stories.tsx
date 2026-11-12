import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner, Button, Cluster, Heading, Stack, Text } from "@puranderdua/ui";

// Flat placeholder images: no network, nothing to load. Light and busy on
// purpose: the scrim has to keep the text readable on the lightest pixels.
const svg = (body: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${body}</svg>`,
  );
const lightImage = svg(
  '<rect width="1600" height="900" fill="#f2f2f2"/><circle cx="1150" cy="330" r="260" fill="#ffffff"/><circle cx="420" cy="640" r="320" fill="#e4e4e4"/>',
);
const poster = svg(
  '<rect width="1600" height="900" fill="#cfcfcf"/><circle cx="800" cy="450" r="240" fill="#f7f7f7"/>',
);

const Content = () => (
  <Stack gap="md" align="start">
    <Heading as="h1" variant="display">
      Build interfaces from tokens
    </Heading>
    <Text variant="lead">
      One source of truth for colour, type and space, themed without touching a
      component.
    </Text>
    <Cluster gap="sm">
      <Button>Get started</Button>
      <Button variant="secondary">Read the docs</Button>
    </Cluster>
  </Stack>
);

const meta = {
  title: "Components/Banner",
  component: Banner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-screen hero band. `height` screen (100svh) | tall (75svh), `align` start | center, `tone` canvas | brand | inverse | gradient. `media` takes any image (covered with `object-cover`) under an `overlay.scrim` layer; `video` takes `{ src, poster }`, plays muted and looped, shows only the poster under `prefers-reduced-motion` and has a visible pause button. Text over media is light, so `canvas` is not offered with it. Scrim `strong` keeps light text at 7:1 over a white pixel, `medium` at 4.5:1 (checked per theme).",
      },
    },
  },
  args: { height: "tall", align: "center", tone: "canvas" },
  argTypes: {
    height: { control: "inline-radio", options: ["screen", "tall"] },
    align: { control: "inline-radio", options: ["start", "center"] },
    tone: {
      control: "inline-radio",
      options: ["canvas", "brand", "inverse", "gradient"],
    },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Banner aria-label="Welcome" {...args}>
      <Content />
    </Banner>
  ),
};

/** Every tone paints its surface and re-points text, links, focus ring and actions. */
export const Tones: Story = {
  render: () => (
    <div>
      {(["canvas", "brand", "inverse", "gradient"] as const).map((tone) => (
        <Banner
          key={tone}
          tone={tone}
          height="tall"
          aria-label={`${tone} banner`}
        >
          <Content />
        </Banner>
      ))}
    </div>
  ),
};

export const ContentAtStart: Story = {
  render: () => (
    <Banner tone="gradient" align="start" aria-label="Welcome">
      <Content />
    </Banner>
  ),
};

/** The scrim keeps light text readable even over a near-white image. */
export const WithImage: Story = {
  render: () => (
    <Banner
      aria-label="Welcome"
      height="tall"
      media={<img src={lightImage} alt="" />}
    >
      <Content />
    </Banner>
  ),
};

export const WithImageMediumScrim: Story = {
  render: () => (
    <Banner
      aria-label="Welcome"
      height="tall"
      scrim="medium"
      tone="gradient"
      media={<img src={lightImage} alt="" />}
    >
      <Content />
    </Banner>
  ),
};

/**
 * Muted, looped, inline. Under `prefers-reduced-motion` only the poster shows
 * and the button is hidden. The sample is the CC0 clip from the MDN examples;
 * offline, the poster stays in place.
 */
export const WithVideo: Story = {
  render: () => (
    <Banner
      aria-label="Welcome"
      height="tall"
      video={{
        src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        type: "video/mp4",
        poster,
      }}
    >
      <Content />
    </Banner>
  ),
};

export const Narrow320: Story = {
  globals: { viewport: { value: "narrow" } },
  render: () => (
    <Banner
      aria-label="Welcome"
      tone="gradient"
      media={<img src={lightImage} alt="" />}
    >
      <Content />
    </Banner>
  ),
};
