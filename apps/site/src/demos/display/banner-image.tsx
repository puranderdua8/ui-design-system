import Image from "next/image";
import { Banner, Heading, Stack, Text } from "@puranderdua/ui";

export const Demo = () => (
  <Banner
    as="div"
    height="tall"
    align="start"
    scrim="strong"
    media={<Image src="/media/hero.svg" alt="" fill unoptimized />}
  >
    <Stack gap="sm">
      <Heading as="h3" variant="h2">
        Image behind a scrim
      </Heading>
      <Text>
        The scrim darkens the image so light text keeps its contrast, even over
        the lightest pixel. The image is decorative, so its alt is empty.
      </Text>
    </Stack>
  </Banner>
);
