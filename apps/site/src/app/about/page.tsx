import type { Metadata } from "next";
import { Container, Heading, Stack, Text } from "@puranderdua/ui";

export const metadata: Metadata = { title: "About and privacy" };

const AboutPage = () => (
  <main id="main" tabIndex={-1} className="py-ds-section-sm">
    <Container size="md">
      <Stack gap="md">
        <Heading as="h1" variant="h1">
          About and privacy
        </Heading>
        <Text variant="lead">
          This site is a design system you can look at and try out.
        </Text>
        <Heading as="h2" variant="h3">
          What we count
        </Heading>
        <Text>
          We count how many times each page is opened, using Vercel Web
          Analytics. It sets no cookies and does not follow you from one site to
          another.
        </Text>
        <Text>
          We do not record anything about the designs you make. Your work stays
          in your browser, and the part of a web address that holds a shared
          design is removed before a page view is counted.
        </Text>
      </Stack>
    </Container>
  </main>
);

export default AboutPage;
