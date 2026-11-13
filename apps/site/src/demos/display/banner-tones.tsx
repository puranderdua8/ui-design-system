import { Banner, Button, Heading, Stack, Text } from "@puranderdua/ui";

const tones = ["canvas", "brand", "inverse", "gradient"] as const;

export const Demo = () => (
  <Stack gap="md" className="w-full">
    {tones.map((tone) => (
      <Banner key={tone} as="div" tone={tone} height="tall" align="center">
        <Stack gap="sm">
          <Heading as="h3" variant="h2">
            {tone} tone
          </Heading>
          <Text>Content sits in a Container over the tone.</Text>
          <div>
            <Button size="sm">Get started</Button>
          </div>
        </Stack>
      </Banner>
    ))}
  </Stack>
);
