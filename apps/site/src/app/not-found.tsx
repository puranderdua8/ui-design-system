import type { Metadata } from "next";
import NextLink from "next/link";
import { Container, Heading, Link, Stack, Text } from "@puranderdua/ui";

export const metadata: Metadata = { title: "Page not found" };

const NotFound = () => (
  <main id="main" tabIndex={-1} className="py-ds-section-sm">
    <Container size="md">
      <Stack gap="md">
        <Heading as="h1" variant="h1">
          Page not found
        </Heading>
        <Text variant="lead">That page does not exist or has moved.</Text>
        <Text>
          <Link asChild>
            <NextLink href="/">Back to the home page</NextLink>
          </Link>
        </Text>
      </Stack>
    </Container>
  </main>
);

export default NotFound;
