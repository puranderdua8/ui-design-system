import { Banner, Heading, Stack, Text } from "@puranderdua/ui";

export const Demo = () => (
  <Banner
    as="div"
    height="tall"
    tone="gradient"
    scrim="medium"
    video={{
      src: "/media/flower.mp4",
      type: "video/mp4",
      poster: "/media/flower-poster.svg",
    }}
  >
    <Stack gap="sm">
      <Heading as="h3" variant="h2">
        Looping video
      </Heading>
      <Text>
        Muted and looped. With reduced motion only the poster shows. The pause
        button in the corner is always available.
      </Text>
    </Stack>
  </Banner>
);
